function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function formatProducts(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items
    .map((item) => `${cleanText(item.name)} x${Number(item.qty || 0)}`)
    .join(" | ");
}

function formatTotalPrice(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Number.isInteger(num) ? num : Number(num.toFixed(2));
}

export function formatOrderForSheet(order) {
  return {
    name: cleanText(order.customer_name),
    phone: cleanText(order.phone),
    products: formatProducts(order.items),
    total: formatTotalPrice(order.total),
    created_at: cleanText(order.created_at) || new Date().toISOString(),
  };
}
