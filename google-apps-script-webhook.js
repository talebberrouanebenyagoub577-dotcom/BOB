/**
 * Orders webhook — appends one row per POST (JSON).
 *
 * 1) Open THIS spreadsheet → Extensions → Apps Script → delete old code → paste this file.
 * 2) Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
 * 3) Copy the /exec URL into backend env: GOOGLE_SHEETS_WEBHOOK_URL=<url>
 *
 * Row 1 headers (exact labels and order):
 * date,orderid,country,name,phone,product,sku,quantity,totalprix,currency,status
 */

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ status: "error", message: "Missing POST body" });
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var statusVal = "";
    if (data.status !== undefined && data.status !== null) {
      statusVal = data.status;
    } else if (data.statue !== undefined && data.statue !== null) {
      statusVal = data.statue;
    }

    sheet.appendRow([
      data.date || "",
      data.orderid || "",
      data.country || "",
      data.name || "",
      data.phone || "",
      data.product || "",
      data.sku || "",
      data.quantity || "",
      data.totalprix !== undefined && data.totalprix !== null ? data.totalprix : "",
      data.currency || "",
      statusVal
    ]);

    return jsonOut_({ status: "ok", orderid: data.orderid });
  } catch (err) {
    return jsonOut_({ status: "error", message: String(err) });
  }
}

function doGet() {
  return jsonOut_({ status: "ok", info: "Orders sheet webhook live" });
}
