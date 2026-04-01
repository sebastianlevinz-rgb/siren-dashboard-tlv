/**
 * Parse Telegram HTML export from "Sirens in Israel" channel
 * Filter for Gush Dan (Area Dan) alerts from 2026-03-24 onwards
 * Deduplicate repeated messages for the same missile event
 * Differentiate pre-alarm vs actual alarm
 */

const fs = require('fs');
const path = require('path');

// ---- CONFIG ----
const EXPORT_DIR = path.join(__dirname, '..', 'ChatExport_2026-03-29');
const HTML_FILES = ['messages.html', 'messages2.html', 'messages3.html', 'messages4.html'];
const START_DATE_STR = '2026-03-24'; // Only new data (existing data goes to Mar 23)
const DEDUP_WINDOW_MINUTES = 10; // Messages within 10 min of same type = same event

// Gush Dan city names (for city-level messages under "Dan" region)
const GUSH_DAN_CITIES = [
  'Tel Aviv', 'Ramat Gan', 'Givatayim', 'Holon', 'Bat-Yam', 'Bat Yam',
  'Bnei Brak', 'Petach Tikva', 'Petah Tikva', 'Rishon LeZion', 'Rishon Lezion',
  'Or Yehuda', 'Azor', 'Yehud', 'Givat Shmuel', 'Kiryat Ono',
  'Ariel Sharon Park', 'Mikveh Israel'
];

// ---- PARSE HTML ----
function extractMessages(html) {
  const messages = [];
  // Match each message block: timestamp + text content
  // Timestamp pattern: title="DD.MM.YYYY HH:MM:SS UTC+02:00"
  const timestampRegex = /title="(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2})\s+UTC([+-]\d{2}:\d{2})"/g;
  const textRegex = /<div class="text">\s*\n?([\s\S]*?)\n?\s*<\/div>/g;

  // Collect all timestamps with positions
  const timestamps = [];
  let match;
  while ((match = timestampRegex.exec(html)) !== null) {
    const [dayStr, monthStr, yearStr] = match[1].split(' ')[0].split('.');
    const timeStr = match[1].split(' ').slice(1).join(' ').trim();
    const isoStr = `${yearStr}-${monthStr}-${dayStr}T${timeStr}${match[2]}`;
    // Store local date/time components directly (avoids UTC conversion issues)
    const localDate = `${yearStr}-${monthStr}-${dayStr}`;
    const [hh, mm] = timeStr.split(':').map(Number);
    timestamps.push({ pos: match.index, date: new Date(isoStr), raw: match[1], localDate, localHour: hh, localMinute: mm });
  }

  // Collect all text blocks with positions
  const texts = [];
  while ((match = textRegex.exec(html)) !== null) {
    texts.push({ pos: match.index, text: match[1].trim() });
  }

  // Match each text to its nearest preceding timestamp
  for (const textBlock of texts) {
    let bestTs = null;
    for (const ts of timestamps) {
      if (ts.pos < textBlock.pos) {
        bestTs = ts;
      } else {
        break;
      }
    }
    if (bestTs) {
      messages.push({ timestamp: bestTs.date, rawDate: bestTs.raw, text: textBlock.text, localDate: bestTs.localDate, localHour: bestTs.localHour, localMinute: bestTs.localMinute });
    }
  }

  return messages;
}

function classifyMessage(text) {
  const lower = text.toLowerCase();

  // Skip if it's just "event has ended"
  const isEnded = lower.includes('the event has ended');
  const isPreAlarm = lower.includes('in a few minutes, alerts are expected');
  const isMissile = lower.includes('rocket and missile attack');
  const isDrone = lower.includes('infiltration of a hostile aerial vehicle');

  // Combined messages like "Rocket and Missile Attack | The event has ended" - these signal the end
  if (isEnded && !isMissile && !isDrone && !isPreAlarm) {
    return { type: 'EVENT_ENDED', threat: null };
  }

  // "In a few minutes... | The event has ended" = ended
  if (isPreAlarm && isEnded && !isMissile && !isDrone) {
    return { type: 'EVENT_ENDED', threat: null };
  }

  if (isPreAlarm && !isMissile && !isDrone) {
    return { type: 'PRE_ALARM', threat: null };
  }

  // Active alarms
  if (isMissile && isDrone) {
    return { type: 'ALARM', threat: 'MISIL_Y_DRONE' };
  }
  if (isMissile) {
    // Even if ended is also in the message, the alarm itself happened
    return { type: isEnded ? 'EVENT_ENDED' : 'ALARM', threat: 'MISIL' };
  }
  if (isDrone) {
    return { type: isEnded ? 'EVENT_ENDED' : 'ALARM', threat: 'DRONE' };
  }

  return { type: 'UNKNOWN', threat: null };
}

function mentionsGushDan(text) {
  // Area-level: "Area Dan" (but not "Kibutz Dan" or "Sheikh Danun")
  if (/Area Dan\b/i.test(text) || /• Area Dan\b/.test(text)) return true;

  // Region-level: <strong>Dan</strong> as region header
  if (/<strong>Dan<\/strong>/.test(text)) return true;

  return false;
}

function extractDanCities(text) {
  // Try to extract specific city names from Dan region section
  const danMatch = text.match(/<strong>Dan<\/strong><br>\s*-\s*([^<]+)/);
  if (danMatch) {
    return danMatch[1].split(',').map(c => c.trim().replace(/,$/, '')).filter(Boolean);
  }
  // If only "Area Dan" is mentioned, we don't have specific cities
  return [];
}

function mapCityToStandard(city) {
  // Map new format city names to the standard names used in alerts-raw.csv
  const mapping = {
    'Tel Aviv - South and Jaffa': 'Tel Aviv - Yafo',
    'Tel Aviv - East': 'Tel Aviv - South',
    'Tel Aviv - City Center': 'Tel Aviv - City Center',
    'Tel Aviv - Across the Yarkon': 'Tel Aviv - North',
    'Ramat Gan - West': 'Ramat Gan',
    'Ramat Gan - East': 'Ramat Gan',
    'Bat-Yam': 'Bat Yam',
    'Petach Tikva': 'Petah Tikva',
  };
  for (const [pattern, standard] of Object.entries(mapping)) {
    if (city.includes(pattern)) return standard;
  }
  // Check if it's a known Gush Dan city
  for (const gd of GUSH_DAN_CITIES) {
    if (city.includes(gd)) return city;
  }
  return city;
}

// Day of week in Spanish abbreviation (matching existing data)
function getDayOfWeek(dateStr) {
  // dateStr is YYYY-MM-DD, parse as local noon to avoid timezone issues
  const d = new Date(dateStr + 'T12:00:00+02:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  return days[d.getDay()];
}

// ---- MAIN ----
function main() {
  console.log('=== Parsing Telegram Export for Gush Dan Alerts ===\n');

  // Parse all HTML files
  let allMessages = [];
  for (const file of HTML_FILES) {
    const filepath = path.join(EXPORT_DIR, file);
    if (!fs.existsSync(filepath)) {
      console.log(`Skipping ${file} (not found)`);
      continue;
    }
    const html = fs.readFileSync(filepath, 'utf8');
    const msgs = extractMessages(html);
    console.log(`${file}: ${msgs.length} messages parsed`);
    allMessages = allMessages.concat(msgs);
  }

  // Filter by date (Mar 24+)
  allMessages = allMessages.filter(m => m.localDate >= START_DATE_STR);
  console.log(`\nMessages from Mar 24+: ${allMessages.length}`);

  // Filter for Gush Dan mentions
  const gushDanMessages = allMessages.filter(m => mentionsGushDan(m.text));
  console.log(`Gush Dan messages: ${gushDanMessages.length}`);

  // Classify each message
  const classified = gushDanMessages.map(m => {
    const cls = classifyMessage(m.text);
    const cities = extractDanCities(m.text);
    const standardCities = [...new Set(cities.map(mapCityToStandard))];
    return {
      ...m,
      ...cls,
      cities: standardCities,
      dateStr: m.localDate,
      hour: m.localHour,
      minute: m.localMinute,
    };
  });

  // Stats by type
  const typeCounts = {};
  for (const m of classified) {
    typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
  }
  console.log('\nMessage types:', typeCounts);

  // Filter only actual alarms and pre-alarms (skip EVENT_ENDED and UNKNOWN)
  const relevant = classified.filter(m => m.type === 'ALARM' || m.type === 'PRE_ALARM');
  console.log(`\nRelevant alerts (alarm + pre-alarm): ${relevant.length}`);

  // ---- DEDUPLICATION ----
  // Sort by timestamp
  relevant.sort((a, b) => a.timestamp - b.timestamp);

  // Group into events: same type within DEDUP_WINDOW_MINUTES = same event
  const events = [];
  for (const msg of relevant) {
    const lastEvent = events[events.length - 1];
    if (
      lastEvent &&
      lastEvent.type === msg.type &&
      (msg.timestamp - lastEvent.timestamp) / 60000 <= DEDUP_WINDOW_MINUTES
    ) {
      // Same event - merge cities, keep first timestamp
      lastEvent.messages.push(msg);
      lastEvent.allCities = [...new Set([...lastEvent.allCities, ...msg.cities])];
      lastEvent.lastTimestamp = msg.timestamp;
    } else {
      events.push({
        type: msg.type,
        threat: msg.threat,
        timestamp: msg.timestamp,
        lastTimestamp: msg.timestamp,
        dateStr: msg.dateStr,
        hour: msg.hour,
        minute: msg.minute,
        dayOfWeek: getDayOfWeek(msg.dateStr),
        allCities: [...msg.cities],
        messages: [msg],
      });
    }
  }

  console.log(`\nDeduplicated events: ${events.length}`);

  // Split into actual alarms vs pre-alarms
  const alarms = events.filter(e => e.type === 'ALARM');
  const preAlarms = events.filter(e => e.type === 'PRE_ALARM');

  console.log(`  Actual alarms: ${alarms.length}`);
  console.log(`  Pre-alarms: ${preAlarms.length}`);

  // ---- OUTPUT DETAILS ----
  console.log('\n=== DETAILED EVENTS ===\n');

  for (const e of events) {
    const label = e.type === 'PRE_ALARM' ? '[PRE-ALARM]' : `[ALARM - ${e.threat}]`;
    const dupes = e.messages.length > 1 ? ` (${e.messages.length} msgs merged)` : '';
    const cities = e.allCities.length > 0 ? e.allCities.join('; ') : '(area-level only)';
    console.log(`${e.dateStr} ${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')} ${label}${dupes}`);
    console.log(`  Cities: ${cities}`);
  }

  // ---- GENERATE CSV DATA ----
  // Group alarms by date for alerts-by-day-hour.csv
  const dailyData = {};
  for (const e of alarms) {
    if (!dailyData[e.dateStr]) {
      dailyData[e.dateStr] = {
        fecha: e.dateStr,
        dia: e.dayOfWeek,
        total: 0,
        misiles: 0,
        drones: 0,
        hours: new Array(24).fill(0),
      };
    }
    const day = dailyData[e.dateStr];
    day.total++;
    if (e.threat === 'MISIL' || e.threat === 'MISIL_Y_DRONE') day.misiles++;
    if (e.threat === 'DRONE' || e.threat === 'MISIL_Y_DRONE') day.drones++;
    day.hours[e.hour]++;
  }

  // Sort by date
  const sortedDays = Object.values(dailyData).sort((a, b) => a.fecha.localeCompare(b.fecha));

  console.log('\n=== NEW ROWS FOR alerts-by-day-hour.csv ===\n');
  for (const day of sortedDays) {
    const hourCols = day.hours.join(',');
    console.log(`${day.fecha},${day.dia},${day.total},${day.misiles},${day.drones},${hourCols}`);
  }

  // Generate alerts-raw.csv rows
  console.log('\n=== NEW ROWS FOR alerts-raw.csv ===\n');
  const lastId = 141; // Last ID in current alerts-raw.csv
  let nextId = lastId + 1;
  const rawRows = [];
  for (const e of alarms) {
    const id = `hist-${String(nextId++).padStart(5, '0')}`;
    const hora = `${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')}`;
    const tipo = e.threat === 'DRONE' ? 'DRONE' : (e.threat === 'MISIL_Y_DRONE' ? 'MISIL' : 'MISIL');
    const citiesEn = e.allCities.length > 0 ? e.allCities.join('; ') : 'Gush Dan (area-level)';
    const citiesHe = ''; // Will need manual mapping
    const row = `${id},${e.dateStr},${hora},${e.minute},${e.dayOfWeek},${tipo},"${citiesEn}","${citiesHe}"`;
    rawRows.push(row);
    console.log(row);
  }

  // Generate pre-alarm CSV
  console.log('\n=== PRE-ALARMS (for reference) ===\n');
  for (const e of preAlarms) {
    const hora = `${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')}`;
    console.log(`${e.dateStr} ${hora} PRE-ALARM (${e.messages.length} msgs)`);
  }

  // ---- WRITE OUTPUT FILES ----
  // Write the new daily rows to append
  const newDailyCSV = sortedDays.map(day => {
    const hourCols = day.hours.join(',');
    return `${day.fecha},${day.dia},${day.total},${day.misiles},${day.drones},${hourCols}`;
  }).join('\n');

  fs.writeFileSync(
    path.join(__dirname, '..', 'parsed-new-daily.csv'),
    newDailyCSV,
    'utf8'
  );

  // Write raw events
  const newRawCSV = rawRows.join('\n');
  fs.writeFileSync(
    path.join(__dirname, '..', 'parsed-new-raw.csv'),
    newRawCSV,
    'utf8'
  );

  // Write pre-alarm data
  const preAlarmCSV = preAlarms.map(e => {
    const hora = `${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')}`;
    return `${e.dateStr},${hora},PRE_ALARM,${e.messages.length}`;
  }).join('\n');

  fs.writeFileSync(
    path.join(__dirname, '..', 'parsed-pre-alarms.csv'),
    preAlarmCSV,
    'utf8'
  );

  console.log('\n=== FILES WRITTEN ===');
  console.log('  parsed-new-daily.csv  (append to alerts-by-day-hour.csv)');
  console.log('  parsed-new-raw.csv    (append to alerts-raw.csv)');
  console.log('  parsed-pre-alarms.csv (pre-alarm events)');

  return { events, alarms, preAlarms, sortedDays, rawRows };
}

main();
