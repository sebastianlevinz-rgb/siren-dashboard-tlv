function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

function dateToStr(cell) {
  if (!cell) return '';
  if (cell instanceof Date) {
    return cell.getFullYear() + '-' + pad2(cell.getMonth() + 1) + '-' + pad2(cell.getDate());
  }
  return String(cell).trim();
}

function findDataSheet(ss) {
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var val = sheets[s].getRange('A1').getValue();
    if (String(val).toLowerCase().indexOf('fecha') !== -1) {
      return sheets[s];
    }
  }
  // Fallback: return first sheet
  return sheets[0];
}

function findRowByDate(sheet, targetDate) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    var cellStr = dateToStr(data[i][0]);
    if (cellStr === targetDate) {
      return i + 2;
    }
  }
  return -1;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = findDataSheet(ss);
    var data = JSON.parse(e.postData.contents);
    var result = [];

    if (data.debug) {
      var lastRow = sheet.getLastRow();
      var vals = sheet.getRange(1, 1, Math.min(lastRow, 5), 1).getValues();
      var info = [];
      for (var i = 0; i < vals.length; i++) {
        var raw = vals[i][0];
        info.push({row: i+1, raw: String(raw), isDate: raw instanceof Date, parsed: dateToStr(raw)});
      }
      return ContentService.createTextOutput(JSON.stringify({ok:true, sheet:sheet.getName(), debug:info}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.updates) {
      for (var u = 0; u < data.updates.length; u++) {
        var upd = data.updates[u];
        var row = findRowByDate(sheet, upd.date);
        if (row === -1) {
          result.push({date: upd.date, status: 'not_found'});
          continue;
        }
        var col = 6 + upd.hour;
        sheet.getRange(row, col).setValue(upd.value);
        var hourValues = sheet.getRange(row, 6, 1, 24).getValues()[0];
        var total = 0;
        for (var h = 0; h < hourValues.length; h++) total += (Number(hourValues[h]) || 0);
        sheet.getRange(row, 3).setValue(total);
        result.push({date: upd.date, hour: upd.hour, value: upd.value, newTotal: total, status: 'ok'});
      }
    }

    if (data.rows) {
      for (var r = 0; r < data.rows.length; r++) {
        var rw = data.rows[r];
        var row = findRowByDate(sheet, rw.date);
        if (row === -1) {
          result.push({date: rw.date, status: 'not_found'});
          continue;
        }
        if (rw.total !== undefined) sheet.getRange(row, 3).setValue(rw.total);
        if (rw.missiles !== undefined) sheet.getRange(row, 4).setValue(rw.missiles);
        if (rw.drones !== undefined) sheet.getRange(row, 5).setValue(rw.drones);
        if (rw.hours && rw.hours.length === 24) {
          sheet.getRange(row, 6, 1, 24).setValues([rw.hours]);
        }
        result.push({date: rw.date, status: 'ok'});
      }
    }

    if (data.addRow) {
      var ar = data.addRow;
      var lastRow = sheet.getLastRow() + 1;
      var hours = ar.hours || [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      var rowData = [ar.date, ar.day || '', ar.total || 0, ar.missiles || 0, ar.drones || 0].concat(hours);
      sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
      result.push({date: ar.date, status: 'added'});
    }

    return ContentService.createTextOutput(JSON.stringify({ok: true, result: result}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = findDataSheet(ss);
  return ContentService.createTextOutput(JSON.stringify({status: 'v4', sheet: sheet.getName(), rows: sheet.getLastRow()}))
    .setMimeType(ContentService.MimeType.JSON);
}
