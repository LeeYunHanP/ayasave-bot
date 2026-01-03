function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RAW DATA");
    const data = JSON.parse(e.postData.contents);

    const ign = String(data.ign || "").trim();
    const gr = data.gr;
    const lvl = data.level;
    const gd = data.gd;
    const playerClass = data.class;

    if (!ign) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "IGN missing" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      const rowIgn = String(rows[i][2] || "").trim(); // Column C

      // EXACT CASE-SENSITIVE MATCH
      if (rowIgn === ign) {

        const now = new Date();
        const hour = now.getHours();
        const isLate = hour >= 20; // 8:00 PM+

        // Date → Column A
        sheet.getRange(i + 1, 1)
          .setValue(now)
          .setNumberFormat("MM/dd/yyyy")
          .setHorizontalAlignment("center");

        // Time → Column B
        sheet.getRange(i + 1, 2)
          .setValue(now)
          .setNumberFormat("hh:mm:ss AM/PM")
          .setHorizontalAlignment("center")
          .setBackground(isLate ? "#f44336" : "#4CAF50");

        // GR → Column D
        sheet.getRange(i + 1, 4).setValue(gr).setHorizontalAlignment("center");

        // LVL → Column E
        sheet.getRange(i + 1, 5).setValue(lvl).setHorizontalAlignment("center");

        // Class → Column F
        sheet.getRange(i + 1, 6).setValue(playerClass).setHorizontalAlignment("center");

        // GD → Column G
        sheet.getRange(i + 1, 7).setValue(gd).setHorizontalAlignment("center");

        return ContentService
          .createTextOutput(JSON.stringify({ status: "updated" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "not_found" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
