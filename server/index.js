import crypto from "node:crypto";
import express from "express";
import { formatOrderForSheet } from "./lib/formatOrderForSheet.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const WEBHOOK_URL = process.env.ORDERS_WEBHOOK_URL || "";
const WEBHOOK_TIMEOUT_MS = Number(process.env.WEBHOOK_TIMEOUT_MS || 10000);
const WEBHOOK_MAX_RETRIES = Number(process.env.WEBHOOK_MAX_RETRIES || 2);

const processedOrderIds = new Map();

app.use(express.json({ limit: "1mb" }));

function cleanupProcessedOrders() {
  const now = Date.now();
  for (const [orderId, processedAt] of processedOrderIds.entries()) {
    if (now - processedAt > 60 * 60 * 1000) {
      processedOrderIds.delete(orderId);
    }
  }
}

function validateOrderPayload(payload) {
  if (!payload || typeof payload !== "object") return "Payload is required.";
  if (!payload.order_id || typeof payload.order_id !== "string") {
    return "order_id is required.";
  }
  if (!payload.customer_name || typeof payload.customer_name !== "string") {
    return "customer_name is required.";
  }
  if (!/^05\d{8}$/.test(String(payload.phone || ""))) {
    return "phone must match Saudi format.";
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return "items must be a non-empty array.";
  }
  if (typeof payload.total !== "number" || payload.total <= 0) {
    return "total must be a positive number.";
  }
  return "";
}

function sanitizeOrderPayload(payload) {
  return {
    order_id: String(payload.order_id),
    created_at: payload.created_at || new Date().toISOString(),
    customer_name: String(payload.customer_name).trim(),
    phone: String(payload.phone).trim(),
    items: payload.items.map((item) => ({
      id: String(item.id || ""),
      sku: String(item.sku || ""),
      name: String(item.name || ""),
      qty: Number(item.qty || 0),
      unit_price: Number(item.unit_price || 0),
    })),
    upsell_offered: Boolean(payload.upsell_offered),
    upsell_product: payload.upsell_product
      ? {
          id: String(payload.upsell_product.id || ""),
          sku: String(payload.upsell_product.sku || ""),
          name: String(payload.upsell_product.name || ""),
        }
      : null,
    upsell_accepted: Boolean(payload.upsell_accepted),
    upsell_price: Number(payload.upsell_price || 0),
    total: Number(payload.total),
    source_page: String(payload.source_page || "storefront"),
    copy_variant: payload.copy_variant === "B" ? "B" : "A",
    idempotency_key:
      payload.idempotency_key ||
      crypto.createHash("sha256").update(String(payload.order_id)).digest("hex"),
  };
}

async function postToWebhookWithRetry(payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= WEBHOOK_MAX_RETRIES; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        // eslint-disable-next-line no-console
        console.error("Webhook HTTP error:", {
          status: response.status,
          body: text,
          attempt: attempt + 1,
        });
        throw new Error(`Webhook returned ${response.status}. ${text}`.trim());
      }

      const result = await response.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.log("Webhook success:", {
        attempt: attempt + 1,
        response: result || "ok",
      });
      return { ok: true, response: result };
    } catch (error) {
      lastError = error;
      // eslint-disable-next-line no-console
      console.error("Webhook request failed:", {
        attempt: attempt + 1,
        message: error instanceof Error ? error.message : String(error),
      });
      if (attempt < WEBHOOK_MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/orders", async (req, res) => {
  cleanupProcessedOrders();

  if (!WEBHOOK_URL) {
    return res.status(500).json({
      ok: false,
      message: "ORDERS_WEBHOOK_URL is not configured on server.",
    });
  }

  const validationError = validateOrderPayload(req.body);
  if (validationError) {
    return res.status(400).json({ ok: false, message: validationError });
  }

  const payload = sanitizeOrderPayload(req.body);

  if (processedOrderIds.has(payload.order_id)) {
    return res.status(200).json({
      ok: true,
      duplicated: true,
      message: "Order already processed.",
    });
  }

  try {
    const sheetPayload = formatOrderForSheet(payload);
    // eslint-disable-next-line no-console
    console.log("Sending formatted order to webhook:", sheetPayload);
    await postToWebhookWithRetry(sheetPayload);
    processedOrderIds.set(payload.order_id, Date.now());
    return res.status(200).json({ ok: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to forward order to webhook:", {
      order_id: payload.order_id,
      message: error instanceof Error ? error.message : String(error),
    });
    return res.status(502).json({
      ok: false,
      message: "Failed to forward order to webhook.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Order API running on http://localhost:${PORT}`);
});
