# 11 — Google Sheets Integration (Webhook + Template)

> Orders post to a Google Sheets-connected webhook via Google Apps Script.
> The JS webhook file is the Apps Script code deployed as a Web App.
> The CSV template defines the exact column structure.

---

## 1. Google Sheet Template (CSV Column Headers)

Create a Google Sheet with **exactly** these columns in row 1 (copy-paste):

```csv
Order ID,Created At,Customer Name,Phone,Item 1 Name,Item 1 SKU,Item 1 Qty,Item 1 Price,Item 2 Name,Item 2 SKU,Item 2 Qty,Item 2 Price,Item 3 Name,Item 3 SKU,Item 3 Qty,Item 3 Price,Upsell Offered,Upsell Product,Upsell Accepted,Upsell Price,Subtotal,Total,Pricing Tier,Source Page,UTM Source,UTM Medium,UTM Campaign,Event ID,Status
```

### Column Descriptions

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| Order ID | Text | `NM-ABC12345` | Unique order reference |
| Created At | DateTime | `2026-05-01 14:30:00` | UTC+3 (KSA time) |
| Customer Name | Text | `نورة العمري` | Arabic name |
| Phone | Text | `0512345678` | Saudi format — stored as text |
| Item 1 Name | Text | `المنظّم الذكي للمقعد` | Arabic |
| Item 1 SKU | Text | `NM-SO-001` | |
| Item 1 Qty | Number | `2` | |
| Item 1 Price | Number | `279` | Tier price for this quantity |
| Item 2–3 ... | Same pattern | | Empty if not ordered |
| Upsell Offered | Boolean | `TRUE` / `FALSE` | |
| Upsell Product | Text | `NM-SG-001` | SKU or empty |
| Upsell Accepted | Boolean | `TRUE` / `FALSE` | |
| Upsell Price | Number | `99` | 0 if not accepted |
| Subtotal | Number | `279` | Before upsell |
| Total | Number | `378` | Including upsell |
| Pricing Tier | Text | `2-unit` | `1-unit`, `2-unit`, `3-unit`, `mixed` |
| Source Page | Text | `/products/seat-organizer` | |
| UTM Source | Text | `tiktok` | |
| UTM Medium | Text | `paid` | |
| UTM Campaign | Text | `seat_org_v1` | |
| Event ID | Text | `purch_abc123_1714567890` | For CAPI deduplication |
| Status | Text | `pending` | `pending`, `confirmed`, `cancelled` |

---

## 2. Google Apps Script Webhook (webhook.js)

Deploy this as a **Google Apps Script Web App** (execute as: Me, access: Anyone).

```javascript
// webhook.js — Google Apps Script
// Deploy as: Web App → Execute as: Me → Who has access: Anyone

const SHEET_NAME = "Orders";
const TIMEZONE = "Asia/Riyadh";   // UTC+3

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendOrder(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendOrder(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Auto-create sheet + headers if not exists
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Order ID", "Created At", "Customer Name", "Phone",
      "Item 1 Name", "Item 1 SKU", "Item 1 Qty", "Item 1 Price",
      "Item 2 Name", "Item 2 SKU", "Item 2 Qty", "Item 2 Price",
      "Item 3 Name", "Item 3 SKU", "Item 3 Qty", "Item 3 Price",
      "Upsell Offered", "Upsell Product", "Upsell Accepted", "Upsell Price",
      "Subtotal", "Total", "Pricing Tier",
      "Source Page", "UTM Source", "UTM Medium", "UTM Campaign",
      "Event ID", "Status"
    ]);
    // Freeze header row
    sheet.setFrozenRows(1);
  }

  // Format date to KSA time
  const createdAt = order.created_at
    ? Utilities.formatDate(new Date(order.created_at), TIMEZONE, "yyyy-MM-dd HH:mm:ss")
    : Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");

  // Extract up to 3 items
  const items = order.items || [];
  const getItem = (idx, field) => {
    const item = items[idx];
    if (!item) return "";
    if (field === "name")  return item.name_ar || item.name || "";
    if (field === "sku")   return item.sku || "";
    if (field === "qty")   return item.qty || item.quantity || 0;
    if (field === "price") return item.unit_price || item.price || 0;
    return "";
  };

  // Determine pricing tier
  const totalQty = items.reduce((s, i) => s + (i.qty || i.quantity || 0), 0);
  let tier = "1-unit";
  if (totalQty === 2) tier = "2-unit";
  else if (totalQty === 3) tier = "3-unit";
  else if (totalQty > 3) tier = "mixed";

  const subtotal = order.subtotal || (order.total - (order.upsell_price || 0));

  const row = [
    order.order_id || order.order_number || "",
    createdAt,
    order.customer_name || "",
    "'" + (order.phone || ""),             // ' prefix keeps phone as text in Sheets
    getItem(0, "name"), getItem(0, "sku"), getItem(0, "qty"), getItem(0, "price"),
    getItem(1, "name"), getItem(1, "sku"), getItem(1, "qty"), getItem(1, "price"),
    getItem(2, "name"), getItem(2, "sku"), getItem(2, "qty"), getItem(2, "price"),
    order.upsell_offered ? "TRUE" : "FALSE",
    order.upsell_product ? (order.upsell_product.sku || order.upsell_product) : "",
    order.upsell_accepted ? "TRUE" : "FALSE",
    order.upsell_price || 0,
    subtotal,
    order.total || 0,
    tier,
    order.source_page || "",
    order.utm_source || "",
    order.utm_medium || "",
    order.utm_campaign || "",
    order.event_id || "",
    "pending"
  ];

  sheet.appendRow(row);
}
```

---

## 3. How to Deploy the Webhook

1. Open [script.google.com](https://script.google.com)
2. Create new project → name it "NidhaAuto Orders Webhook"
3. Paste the code above into `Code.gs`
4. Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** → copy the **Web app URL**
6. Paste the URL into backend `.env` as `WEBHOOK_URL=...`
7. Test by sending a POST request with sample order JSON

---

## 4. Backend Webhook Service

```python
# backend/app/services/webhook_service.py
import httpx
import os
import asyncio
from datetime import datetime, timezone

WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
MAX_RETRIES = int(os.getenv("WEBHOOK_MAX_RETRIES", 2))
TIMEOUT_MS  = int(os.getenv("WEBHOOK_TIMEOUT_MS", 10000)) / 1000

def format_order_for_sheet(order: dict) -> dict:
    """Format order dict to match Google Sheets webhook contract."""
    return {
        "order_id":        order.get("order_number") or order.get("id"),
        "created_at":      datetime.now(timezone.utc).isoformat(),
        "customer_name":   order.get("customer_name", ""),
        "phone":           order.get("phone", ""),
        "items":           order.get("items", []),
        "upsell_offered":  order.get("upsell_offered", False),
        "upsell_product":  order.get("upsell_product"),
        "upsell_accepted": order.get("upsell_accepted", False),
        "upsell_price":    order.get("upsell_price", 0),
        "subtotal":        order.get("subtotal", order.get("total", 0)),
        "total":           order.get("total", 0),
        "source_page":     order.get("source_page", ""),
        "utm_source":      order.get("utm_source", ""),
        "utm_medium":      order.get("utm_medium", ""),
        "utm_campaign":    order.get("utm_campaign", ""),
        "event_id":        order.get("event_id", ""),
    }

async def send(order: dict) -> None:
    if not WEBHOOK_URL:
        return

    payload = format_order_for_sheet(order)

    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_MS) as client:
                r = await client.post(WEBHOOK_URL, json=payload)
                if r.status_code < 300:
                    return
        except Exception:
            pass
        if attempt < MAX_RETRIES:
            await asyncio.sleep(0.5 * (attempt + 1))
```

---

## 5. Order Payload Sent to Webhook

This is the JSON format the backend sends to the Google Sheets webhook:

```json
{
  "order_id": "NM-ABC12345",
  "created_at": "2026-05-01T11:30:00Z",
  "customer_name": "نورة العمري",
  "phone": "0512345678",
  "items": [
    {
      "name_ar": "المنظّم الذكي للمقعد",
      "sku": "NM-SO-001",
      "qty": 2,
      "unit_price": 279
    }
  ],
  "upsell_offered": true,
  "upsell_product": { "sku": "NM-SG-001", "name": "حامي فراغ المقعد" },
  "upsell_accepted": false,
  "upsell_price": 0,
  "subtotal": 279,
  "total": 279,
  "source_page": "/products/seat-organizer",
  "utm_source": "tiktok",
  "utm_medium": "paid",
  "utm_campaign": "seat_org_v1",
  "event_id": "purch_abc123_1714567890"
}
```

---

## 6. Google Sheet Conditional Formatting (Optional)

Apply these rules to the `Status` column (Column AC):

| Value | Background Color |
|-------|-----------------|
| `pending` | Yellow `#FFF9C4` |
| `confirmed` | Green `#DCFCE7` |
| `cancelled` | Red `#FEE2E2` |

Apply a filter to the `Status` column to easily sort by pending orders.

---

## 7. Webhook Testing

Test the webhook with `curl`:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "NM-TEST001",
    "created_at": "2026-05-01T11:00:00Z",
    "customer_name": "Test User",
    "phone": "0512345678",
    "items": [{"name_ar": "المنظّم الذكي للمقعد", "sku": "NM-SO-001", "qty": 1, "unit_price": 199}],
    "upsell_offered": false,
    "upsell_accepted": false,
    "upsell_price": 0,
    "subtotal": 199,
    "total": 199,
    "source_page": "/test",
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "event_id": "purch_test_001"
  }'
```

Expected response: `{"ok": true}`
