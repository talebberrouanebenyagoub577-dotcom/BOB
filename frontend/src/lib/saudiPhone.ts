/** تطبيع والتحقق من أرقام الجوال السعودية لتجربة طلب وميتا أكثر تحمّلاً للصيغ. */

/** يعيد القيم المطبيعة بحيث تبدأ بـ 05 وطولها 10 أرقام، أو سلسلة أرقام غير كاملة عند الخطأ */
export function normalizeSaudiPhone(value: string): string {
  let d = value.replace(/\D/g, "");

  /** ٠٠٩٦٦… أو 009665… بعد إزالة غير الرقم تصبح بدون تصفير مزدوج تمهيدًا */
  if (d.startsWith("00")) d = d.slice(2);

  /** 966 5xxxxxxxx */
  if (/^9665\d{8}$/.test(d)) return `0${d.slice(3)}`;

  /** 05xxxxxxxx */
  if (/^05\d{8}$/.test(d)) return d;

  /** 5xxxxxxxx (٩ أرقام يبدأ ٥ ثم ثمانية) — كثيرًا ما يكتبونه بدون صفر أمام الثمانية */
  if (/^5\d{8}$/.test(d) && d.length === 9) return `0${d}`;

  return d;
}

export function isValidSaudiPhone(value: string): boolean {
  return /^05\d{8}$/.test(normalizeSaudiPhone(value));
}
