/** رسالة عربية من استجابة FastAPI أو شبكة جلب الطلب */

export function formatOrderApiError(res: Response, body: unknown): string {
  if (body && typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (first && typeof first === "object" && first !== null && "msg" in first) {
        const msg = (first as { msg: unknown }).msg;
        if (typeof msg === "string") return msg;
      }
    }
  }
  if (!res.ok && res.status >= 500) {
    return "الخادم غير متاح مؤقتاً. تأكد أن الخلفية تعمل على المنفذ 8000 أو أعد المحاولة.";
  }
  if (res.status === 403) {
    return "الخدمة متاحة من داخل المملكة فقط، أو تحقق من الرقم المصرّح به.";
  }
  return `تعذّر إتمام الطلب (${res.status}).`;
}
