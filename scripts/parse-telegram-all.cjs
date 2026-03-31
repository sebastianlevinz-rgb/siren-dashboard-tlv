/**
 * Parse Telegram HTML export from "Sirens in Israel" channel
 * Extract ALL regions across Israel from 2026-02-28 onwards
 * Deduplicate repeated messages for the same event
 * Output alerts.json with region classification
 */

const fs = require('fs');
const path = require('path');

// ---- CONFIG ----
const EXPORT_DIR = path.join(__dirname, '..', 'ChatExport_2026-03-31');
const HTML_FILES = ['messages.html', 'messages2.html', 'messages3.html', 'messages4.html'];
const START_DATE_STR = '2026-02-28';
const DEDUP_WINDOW_MINUTES = 10;

// ---- REGION MAPPING ----
// Maps Telegram sub-region names to macro-region codes
const REGION_MAP = {
  // Gush Dan (Tel Aviv Metro)
  'Dan': 'gush_dan',
  'Yarkon': 'gush_dan',

  // North
  'Confrontation Line': 'north',
  'Upper Galilee': 'north',
  'Lower Galilee': 'north',
  'Center Galilee': 'north',
  'Golan': 'north',
  'North Golan': 'north',
  'South Golan': 'north',
  'Katzrin': 'north',
  'HaAmakim': 'north',
  'Tavor': 'north',
  "Beit She'an Valley": 'north',
  "Beit She\u2019an Valley": 'north',

  // Haifa
  'Haifa': 'haifa',
  'HaCarmel': 'haifa',
  'Hof HaCarmel': 'haifa',
  'Yearot HaCarmel': 'haifa',
  'HaMifratz': 'haifa',
  'Krayot': 'haifa',

  // Center
  'Sharon': 'center',
  'Hefer': 'center',
  'Menashe': 'center',
  'Wadi Ara': 'center',
  'HaShfela': 'center',
  'Shfelat Yehuda': 'center',
  'Beit Shemesh': 'center',

  // Jerusalem & Judea/Samaria
  'Jerusalem': 'jerusalem',
  'Yehuda': 'jerusalem',
  'Shomron': 'jerusalem',
  "Bika'a": 'jerusalem',
  "Bika\u2019a": 'jerusalem',

  // South
  'Gaza Envelope': 'south',
  'Lachish': 'south',
  'West Lachish': 'south',
  'Drom Hashfela': 'south',
  'Center Negev': 'south',
  'South Negev': 'south',
  'West Negev': 'south',
  'Arava': 'south',
  'Eilat': 'south',
  'Dead Sea': 'south',

  // Hebrew region names
  'קו העימות': 'north',
  'גליל עליון': 'north',
  'גליל תחתון': 'north',
  'מרכז הגליל': 'north',
  'גולן': 'north',
  'גולן צפון': 'north',
  'גולן דרום': 'north',
  'קצרין': 'north',
  'העמקים': 'north',
  'תבור': 'north',
  'בקעת בית שאן': 'north',
  'חיפה': 'haifa',
  'הכרמל': 'haifa',
  'חוף הכרמל': 'haifa',
  'יערות הכרמל': 'haifa',
  'המפרץ': 'haifa',
  'קריות': 'haifa',
  'דן': 'gush_dan',
  'ירקון': 'gush_dan',
  'שרון': 'center',
  'חפר': 'center',
  'מנשה': 'center',
  'ואדי ערה': 'center',
  'השפלה': 'center',
  'שפלת יהודה': 'center',
  'בית שמש': 'center',
  'ירושלים': 'jerusalem',
  'יהודה': 'jerusalem',
  'שומרון': 'jerusalem',
  'בקעה': 'jerusalem',
  'עוטף עזה': 'south',
  'לכיש': 'south',
  'מערב לכיש': 'south',
  'דרום השפלה': 'south',
  'נגב מרכזי': 'south',
  'נגב דרומי': 'south',
  'נגב מערבי': 'south',
  'ערבה': 'south',
  'אילת': 'south',
  'ים המלח': 'south',
};

// Region display info
const REGIONS = {
  all: { en: 'All Israel', es: 'Todo Israel', he: 'כל ישראל' },
  gush_dan: { en: 'Gush Dan', es: 'Gush Dan', he: 'גוש דן' },
  north: { en: 'North', es: 'Norte', he: 'צפון' },
  haifa: { en: 'Haifa', es: 'Haifa', he: 'חיפה' },
  center: { en: 'Center', es: 'Centro', he: 'מרכז' },
  jerusalem: { en: 'Jerusalem', es: 'Jerusalem', he: 'ירושלים' },
  south: { en: 'South', es: 'Sur', he: 'דרום' },
};

// ---- PARSE HTML ----
function extractMessages(html) {
  const messages = [];
  const timestampRegex = /title="(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2})\s+UTC([+-]\d{2}:\d{2})"/g;
  const textRegex = /<div class="text">\s*\n?([\s\S]*?)\n?\s*<\/div>/g;

  const timestamps = [];
  let match;
  while ((match = timestampRegex.exec(html)) !== null) {
    const [dayStr, monthStr, yearStr] = match[1].split(' ')[0].split('.');
    const timeStr = match[1].split(' ').slice(1).join(' ').trim();
    const isoStr = `${yearStr}-${monthStr}-${dayStr}T${timeStr}${match[2]}`;
    const localDate = `${yearStr}-${monthStr}-${dayStr}`;
    const [hh, mm] = timeStr.split(':').map(Number);
    timestamps.push({ pos: match.index, date: new Date(isoStr), raw: match[1], localDate, localHour: hh, localMinute: mm, tz: match[2] });
  }

  const texts = [];
  while ((match = textRegex.exec(html)) !== null) {
    texts.push({ pos: match.index, text: match[1].trim() });
  }

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
      messages.push({
        timestamp: bestTs.date,
        rawDate: bestTs.raw,
        text: textBlock.text,
        localDate: bestTs.localDate,
        localHour: bestTs.localHour,
        localMinute: bestTs.localMinute,
        tz: bestTs.tz,
      });
    }
  }

  return messages;
}

function classifyMessage(text) {
  const lower = text.toLowerCase();
  const isEnded = lower.includes('the event has ended');
  const isPreAlarm = lower.includes('in a few minutes, alerts are expected');
  const isMissile = lower.includes('rocket and missile attack');
  const isDrone = lower.includes('infiltration of a hostile aerial vehicle');

  if (isEnded && !isMissile && !isDrone && !isPreAlarm) return { type: 'EVENT_ENDED', threat: null };
  if (isPreAlarm && isEnded && !isMissile && !isDrone) return { type: 'EVENT_ENDED', threat: null };
  if (isPreAlarm && !isMissile && !isDrone) return { type: 'PRE_ALARM', threat: null };

  if (isMissile && isDrone) return { type: 'ALARM', threat: 'MISIL_Y_DRONE' };
  if (isMissile) return { type: isEnded ? 'EVENT_ENDED' : 'ALARM', threat: 'MISIL' };
  if (isDrone) return { type: isEnded ? 'EVENT_ENDED' : 'ALARM', threat: 'DRONE' };

  return { type: 'UNKNOWN', threat: null };
}

function extractRegionsAndCities(text) {
  const results = [];
  const decode = s => s.replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');

  // Pattern 1: 📍 <strong>RegionName</strong><br>- City1, City2,<br>
  const regionPattern = /📍\s*<strong>([^<]+)<\/strong>(?:<br>\s*-\s*([^<]*?)(?:<br>|$))?/g;
  let m;
  while ((m = regionPattern.exec(text)) !== null) {
    const subRegion = decode(m[1].trim());
    const citiesStr = decode(m[2] || '');
    const cities = citiesStr.split(',').map(c => c.trim().replace(/,$/, '')).filter(Boolean);
    addRegion(results, subRegion, cities);
  }

  // Pattern 2: • Area RegionName<br> (area-level alerts without specific cities)
  const areaPattern = /[•·]\s*Area\s+([^<\n]+?)(?:<br>|$)/g;
  while ((m = areaPattern.exec(text)) !== null) {
    const subRegion = decode(m[1].trim().replace(/,\s*$/, ''));
    // Only add if not already found from pattern 1
    if (!results.find(r => r.subRegion === subRegion)) {
      addRegion(results, subRegion, []);
    }
  }

  // Pattern 3: Hebrew • AreaName<br> (for Hebrew messages)
  const hebrewAreaPattern = /[•·]\s*(?:אזור\s+)?([^\n<•·]+?)(?:<br>|$)/g;
  while ((m = hebrewAreaPattern.exec(text)) !== null) {
    const subRegion = decode(m[1].trim().replace(/,\s*$/, ''));
    if (REGION_MAP[subRegion] && !results.find(r => r.subRegion === subRegion)) {
      addRegion(results, subRegion, []);
    }
  }

  return results;
}

function addRegion(results, subRegion, cities) {
  // Skip noise
  if (/^Regions?\s*\(\d+\)/i.test(subRegion)) return;
  if (/rocket|missile|event|hostile|aerial|few minutes/i.test(subRegion)) return;
  if (!subRegion || subRegion.length < 2) return;

  const macroRegion = REGION_MAP[subRegion];
  if (macroRegion) {
    results.push({ subRegion, macroRegion, cities });
  } else {
    const key = Object.keys(REGION_MAP).find(k => subRegion.includes(k) || k.includes(subRegion));
    if (key) {
      results.push({ subRegion, macroRegion: REGION_MAP[key], cities });
    } else {
      console.warn(`  Unknown region: "${subRegion}"`);
      results.push({ subRegion, macroRegion: 'unknown', cities });
    }
  }
}

// ---- MAIN ----
function main() {
  console.log('=== Parsing Telegram Export for ALL Israel ===\n');

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

  // Filter by date
  allMessages = allMessages.filter(m => m.localDate >= START_DATE_STR);
  console.log(`\nMessages from ${START_DATE_STR}+: ${allMessages.length}`);

  // Classify and extract regions
  const classified = [];
  for (const m of allMessages) {
    const cls = classifyMessage(m.text);
    if (cls.type !== 'ALARM') continue; // Only actual alarms

    const regionData = extractRegionsAndCities(m.text);
    if (regionData.length === 0) continue; // No regions found

    const macroRegions = [...new Set(regionData.map(r => r.macroRegion))].filter(r => r !== 'unknown');
    const allCities = regionData.flatMap(r => r.cities);
    const subRegions = regionData.map(r => r.subRegion);

    if (macroRegions.length === 0) continue;

    classified.push({
      timestamp: m.timestamp,
      localDate: m.localDate,
      localHour: m.localHour,
      localMinute: m.localMinute,
      tz: m.tz,
      threat: cls.threat,
      regions: macroRegions,
      subRegions,
      cities: allCities,
    });
  }

  console.log(`Classified alarms: ${classified.length}`);

  // Sort by timestamp
  classified.sort((a, b) => a.timestamp - b.timestamp);

  // Deduplicate: same threat type within DEDUP_WINDOW_MINUTES = same event
  const events = [];
  for (const msg of classified) {
    const lastEvent = events[events.length - 1];
    if (
      lastEvent &&
      lastEvent.threat === msg.threat &&
      (msg.timestamp - lastEvent.timestamp) / 60000 <= DEDUP_WINDOW_MINUTES
    ) {
      // Same event - merge regions and cities
      lastEvent.regions = [...new Set([...lastEvent.regions, ...msg.regions])];
      lastEvent.subRegions = [...new Set([...lastEvent.subRegions, ...msg.subRegions])];
      lastEvent.cities = [...new Set([...lastEvent.cities, ...msg.cities])];
      lastEvent.msgCount++;
    } else {
      events.push({
        threat: msg.threat,
        timestamp: msg.timestamp,
        localDate: msg.localDate,
        localHour: msg.localHour,
        localMinute: msg.localMinute,
        tz: msg.tz,
        regions: [...msg.regions],
        subRegions: [...msg.subRegions],
        cities: [...msg.cities],
        msgCount: 1,
      });
    }
  }

  console.log(`Deduplicated events: ${events.length}`);

  // Region stats
  const regionCounts = {};
  for (const e of events) {
    for (const r of e.regions) {
      regionCounts[r] = (regionCounts[r] || 0) + 1;
    }
  }
  console.log('\nAlerts per region:');
  for (const [r, c] of Object.entries(regionCounts).sort((a, b) => b[1] - a[1])) {
    const label = REGIONS[r]?.en || r;
    console.log(`  ${label}: ${c}`);
  }

  // Generate alerts.json
  const alerts = events.map((e, i) => {
    const id = `tg-${String(i + 1).padStart(5, '0')}`;
    const isoTimestamp = `${e.localDate}T${String(e.localHour).padStart(2, '0')}:${String(e.localMinute).padStart(2, '0')}:00${e.tz}`;
    const d = new Date(e.localDate + 'T12:00:00+02:00');

    let threat, threatCode;
    if (e.threat === 'DRONE') {
      threat = 'hostile_aircraft';
      threatCode = 5;
    } else {
      threat = 'missiles';
      threatCode = 0;
    }

    return {
      id,
      timestamp: isoTimestamp,
      unix: Math.floor(new Date(isoTimestamp).getTime() / 1000),
      cities: [],
      cities_en: e.cities.slice(0, 10), // Limit city list size
      threat,
      threat_code: threatCode,
      isDrill: false,
      day_of_week: d.getDay(),
      hour: e.localHour,
      date: e.localDate,
      regions: e.regions,
    };
  });

  // Write alerts.json
  const outPath = path.join(__dirname, '..', 'public', 'data', 'alerts.json');
  fs.writeFileSync(outPath, JSON.stringify(alerts, null, 2), 'utf8');
  console.log(`\nWrote ${alerts.length} alerts to ${outPath}`);

  // Summary by date
  const byDate = {};
  for (const a of alerts) {
    byDate[a.date] = (byDate[a.date] || 0) + 1;
  }
  const dates = Object.keys(byDate).sort();
  console.log(`\nDate range: ${dates[0]} to ${dates[dates.length - 1]}`);
  console.log(`Total days with alerts: ${dates.length}`);
  console.log(`Total events: ${alerts.length}`);
}

main();
