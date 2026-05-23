"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import Image from "next/image";

import { Header } from "@/components/Header";

import { Footer } from "@/components/Footer";

import { CheckoutPopup } from "@/components/CheckoutPopup";

import { UpsellModal } from "@/components/UpsellModal";

import { PRODUCTS, UPSELL_PRICE } from "@/data/products";

import type { Product } from "@/types";

import { trackPurchase } from "@/lib/pixels";

const CALL_START_HOUR = 9;

const CALL_END_HOUR = 21;

const COUNTDOWN_SECONDS = 10 * 60;

interface OrderLine {
  sku: string;

  qty: number;

  unit_price: number;

  name_ar: string;
}

interface OrderData {
  items: OrderLine[];

  total: number;

  event_id: string;

  order_number?: string;

  upsell_accepted?: boolean;

  upsell_sku?: string;

  upsell_name_ar?: string;
}

function hourInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,

    hour: "numeric",

    hour12: false,
  }).formatToParts(date);

  const h = parts.find((p) => p.type === "hour")?.value;

  return h != null ? parseInt(h, 10) : 12;
}

function isWithinCallWindow(date: Date): boolean {
  const h = hourInTimeZone(date, "Asia/Riyadh");

  return h >= CALL_START_HOUR && h < CALL_END_HOUR;
}

function formatMoney(n: number): string {
  return `${n.toLocaleString("ar-SA")} ر.س`;
}

function AnimatedThankYouCheck() {
  return (
    <div className="flex justify-center" aria-hidden>
      <div className="animate-thank-you-check-pop">
        <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-emerald-500 shadow-[0_14px_48px_-10px_rgba(16,185,129,0.75)] ring-[3px] ring-emerald-300/55 ring-offset-[6px] ring-offset-[#070707] xs:h-[5.25rem] xs:w-[5.25rem] xs:ring-offset-8">
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12 text-white xs:h-[3.35rem] xs:w-[3.35rem]"
            aria-hidden
          >
            <path
              d="M7 13l3 3 7-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-thank-you-check-draw"
              style={{ strokeDasharray: 22, strokeDashoffset: 22 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function OrderStatusRoadmap() {
  const steps = [
    { id: "placed", title: "تم الطلب", state: "done" as const },

    { id: "confirm", title: "قيد التأكيد", state: "current" as const },

    { id: "ship", title: "جاري التوصيل", state: "pending" as const },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm xs:p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <h2 className="text-base font-black text-white sm:text-lg">
          مسار الطلب
        </h2>

        <span className="rounded-full border border-gold/35 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-gold/95 xs:text-[11px]">
          خطوات واضحة حتى يصلك الطلب
        </span>
      </div>

      {/* Mobile-first: عمودي صغير، ثم صف أفقي من sm */}

      <div className="relative sm:hidden">
        <div className="mr-[15px] flex flex-col gap-0 border-r-2 border-dashed border-white/15 pr-6">
          {steps.map((s, i) => (
            <div key={s.id} className="relative pb-8 last:pb-0">
              <span
                className={`absolute right-[-26px] top-1 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 text-[11px] font-black ${
                  s.state === "done"
                    ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_24px_-4px_rgba(16,185,129,0.8)]"
                    : s.state === "current"
                      ? "animate-thank-you-pulse-soft border-gold bg-black text-gold"
                      : "border-white/20 bg-[#141414] text-white/35"
                }`}
              >
                {s.state === "done" ? "✓" : i + 1}
              </span>

              <p
                className={`text-sm font-black leading-snug ${
                  s.state === "pending"
                    ? "text-white/35"
                    : s.state === "current"
                      ? "text-gold"
                      : "text-white"
                }`}
              >
                {s.title}
              </p>

              {s.state === "current" && (
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-white/55">
                  فريق التأكيد يتواصل معك لتأكيد العنوان — الدفع عند الاستلام
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-2 sm:flex sm:flex-row sm:items-start sm:justify-between">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`relative flex min-w-0 flex-1 flex-col items-center text-center ${
              i < steps.length - 1
                ? "after:pointer-events-none after:absolute after:inset-x-[-6%] after:top-[19px] after:z-0 after:h-[3px] after:rounded-full after:bg-gradient-to-l after:from-gold/55 after:via-white/12 after:to-transparent"
                : ""
            }`}
          >
            <span
              className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black ${
                s.state === "done"
                  ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_28px_-6px_rgba(34,197,94,0.85)]"
                  : s.state === "current"
                    ? "animate-thank-you-pulse-soft border-gold bg-black text-gold"
                    : "border-white/20 bg-[#141414] text-white/30"
              }`}
            >
              {s.state === "done" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M6 13l4 4 9-11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </span>

            <p
              className={`mt-3 text-xs font-black sm:text-[13px] ${
                s.state === "pending"
                  ? "text-white/35"
                  : s.state === "current"
                    ? "text-gold"
                    : "text-white"
              }`}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 hidden rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-center text-[11px] font-semibold leading-relaxed text-white/55 sm:block">
        المرحلة الحالية: <span className="text-gold">قيد التأكيد</span> — نتصل
        بك لتأكيد الهوية والعنوان قبل الشحن
      </p>
    </section>
  );
}

export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);

  const [landedAt] = useState(() => new Date());

  useEffect(() => {
    const raw = sessionStorage.getItem("last_order");

    if (raw) {
      const data: OrderData = JSON.parse(raw);

      setOrder(data);

      trackPurchase(
        data.event_id,
        data.total,
        data.items.map((i) => i.sku),
      );
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);

    return () => clearTimeout(t);
  }, [timeLeft]);

  const inCallWindow = isWithinCallWindow(landedAt);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");

  const seconds = String(timeLeft % 60).padStart(2, "0");

  const lineRows = useMemo(() => {
    if (!order) return [];

    const rows: {
      key: string;

      title: string;

      subtitle: string;

      lineTotal: number;

      tag?: string;
    }[] = order.items.map((item) => ({
      key: item.sku,

      title: item.name_ar,

      subtitle: `${item.qty} × ${formatMoney(item.unit_price)}`,

      lineTotal: item.unit_price * item.qty,
    }));

    if (order.upsell_accepted && order.upsell_sku && order.upsell_name_ar) {
      rows.push({
        key: `upsell-${order.upsell_sku}`,

        title: order.upsell_name_ar,

        subtitle: "عرض مضاف مع طلبك",

        lineTotal: UPSELL_PRICE,

        tag: "عرض خاص",
      });
    }

    return rows;
  }, [order]);

  const productsSummary = useMemo(() => {
    if (!order || order.items.length === 0) return "—";

    const parts = order.items.map((i) =>
      i.qty > 1 ? `${i.name_ar} ×${i.qty}` : i.name_ar,
    );

    if (order.upsell_accepted && order.upsell_name_ar) {
      parts.push(order.upsell_name_ar);
    }

    return parts.join("، ");
  }, [order]);

  const suggestionProducts = useMemo((): Product[] => {
    if (!order) return PRODUCTS;

    const bought = new Set(order.items.map((i) => i.sku));

    if (order.upsell_accepted && order.upsell_sku) bought.add(order.upsell_sku);

    return PRODUCTS.filter((p) => !bought.has(p.sku));
  }, [order]);

  return (
    <>
      <Header />

      <CheckoutPopup />

      <UpsellModal />

      <main className="min-h-screen bg-[#070707] pb-16 pt-0 text-white">
        <div className="border-b border-gold/25 bg-gradient-to-l from-black via-[#15100a] to-black">
          <div className="mx-auto flex max-w-2xl flex-col gap-1.5 px-4 py-3 text-center sm:flex-row-reverse sm:items-center sm:justify-center sm:text-right">
            <span className="inline-flex shrink-0 items-center justify-center gap-2 text-xs font-black text-gold sm:text-sm">
              <span aria-hidden className="text-lg leading-none">
                📵➜📞
              </span>
              المكالمة قد لا تظهر الاسم التجاري — الرجاء الرد
            </span>

            <span
              className="hidden h-4 w-px bg-gold/30 sm:inline"
              aria-hidden
            />

            <span className="text-[11px] font-semibold leading-relaxed text-white/75 xs:text-xs">
              تأكيد هاتفي للعنوان والهوية قبل الشحن • الدفع عند الاستلام
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-6 px-4 pt-8 xs:space-y-7 xs:pt-10">
          {/* Hero — رسالة الأساس مع أيقونة صح متحركة */}

          <header className="text-center">
            <AnimatedThankYouCheck />

            <div className="mt-8 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold/80">
                شكرًا لاختيارك لنا
              </p>

              <h1 className="text-balance px-1 text-[1.625rem] font-black leading-snug xs:text-[1.85rem] sm:text-4xl">
                تم استلام طلبك بنجاح
              </h1>

              <p className="mx-auto max-w-md text-[15px] font-medium leading-relaxed text-white/65">
                نشكر ثقتك الغالية بنا؛ طلبك مسجّل لدينا وجاري تجهيزه وفق أفضل
                المعايير. فريق الدعم سيُكمل معك تأكيد التفاصيل قبل الشحن.
              </p>
            </div>
          </header>

          {/* تفاصيل الطلب — جدول COD */}

          <section className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white text-black shadow-[0_24px_80px_-32px_rgba(201,162,77,0.35)]">
            <div className="flex flex-col gap-2 border-b border-black/10 bg-black px-4 py-3.5 sm:flex-row-reverse sm:items-center sm:justify-between sm:px-5">
              <h2 className="text-base font-black text-white sm:text-lg">
                تفاصيل الطلب
              </h2>

              <span className="inline-flex items-center gap-2 self-start rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-[11px] font-black text-gold sm:self-auto">
                <span
                  className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(201,162,77,0.9)]"
                  aria-hidden
                />
                الدفع عند الاستلام (COD)
              </span>
            </div>

            <div className="-mx-px overflow-x-auto">
              <table className="w-full min-w-[280px] text-right text-sm">
                <thead>
                  <tr className="border-b border-black/[0.08] bg-neutral-50">
                    <th className="px-3 py-3 text-[11px] font-black text-neutral-600 sm:px-4 sm:text-xs">
                      رقم الطلب
                    </th>

                    <th className="px-3 py-3 text-[11px] font-black text-neutral-600 sm:px-4 sm:text-xs">
                      المنتج
                    </th>

                    <th className="px-3 py-3 text-[11px] font-black text-neutral-600 sm:whitespace-nowrap sm:px-4 sm:text-xs">
                      الإجمالي
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-black/[0.06] align-top">
                    <td className="px-3 py-4 font-black tabular-nums text-neutral-950 sm:px-4">
                      {order?.order_number ? `#${order.order_number}` : "—"}
                    </td>

                    <td className="max-w-[1px] px-3 py-4">
                      <p className="break-words text-[13px] font-semibold leading-relaxed text-neutral-900">
                        {productsSummary}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4">
                      <span className="text-base font-black text-gold tabular-nums sm:text-lg">
                        {order ? formatMoney(order.total) : "—"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!order && (
              <p className="border-t border-black/[0.06] bg-neutral-50 px-4 py-3 text-center text-xs font-semibold text-neutral-500">
                لم يُعثر على ملخص لهذه الجلسة — إذا أتممت الدفع الآن ستظهر
                البيانات هنا بعد إعادة التحميل.
              </p>
            )}
          </section>

          <OrderStatusRoadmap />

          {inCallWindow ? (
            <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/35 p-4 xs:p-5">
              <p className="text-base font-black text-white">
                انتظر مكالمتنا خلال أقل من ١٠ دقائق
              </p>

              <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/70">
                ساعات التأكيد الهاتفي: من ٩ صباحًا إلى ٩ مساءً بتوقيت الرياض.
                الرجاء الإجابة حتى لو لم يظهر اسم المتجر على المتصل.
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  وقت تقريبي لاتصال التأكيد
                </p>

                <p
                  className="mt-2 text-4xl font-black tabular-nums text-emerald-400"
                  aria-live="polite"
                >
                  {minutes}:{seconds}
                </p>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-white/12 bg-[#121212] p-4 xs:p-5">
              <p className="text-base font-black text-white">
                طلبك مسجل — سنُكمّل التأكيد في أوّل ساعات العمل القادمة
              </p>

              <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/65">
                خارج نافذة الاتصال (٩ ص–٩ م بتوقيت الرياض). ستصلك مكالمتنا
                لتأكيد الطلب قبل الشحن — الدفع يتم نقدًا عند التسليم.
              </p>
            </section>
          )}

          {/* ملخص الأسطر التفصيلي عند وجود الطلب */}

          {order && lineRows.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#0e0e0e] px-4 py-5 xs:px-5">
              <h2 className="text-base font-black text-gold">تفاصيل العناصر</h2>

              <div className="mt-4 divide-y divide-white/[0.08]">
                {lineRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.tag && (
                          <span className="rounded-md bg-gold/20 px-2 py-0.5 text-[10px] font-black text-gold">
                            {row.tag}
                          </span>
                        )}

                        <p className="font-bold text-white">{row.title}</p>
                      </div>

                      <p className="mt-1 text-xs font-semibold text-white/45">
                        {row.subtitle}
                      </p>
                    </div>

                    <p className="shrink-0 text-left text-lg font-black text-gold tabular-nums sm:text-right">
                      {formatMoney(row.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-1 border-t border-white/10 pt-4 text-right sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-black text-white/80">
                  الإجمالي المستحق عند التسليم
                </span>

                <span className="text-xl font-black text-gold tabular-nums sm:text-2xl">
                  {formatMoney(order.total)}
                </span>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-gold/35 bg-gradient-to-br from-neutral-950 to-black px-5 py-6 xs:px-6">
            <h2 className="text-lg font-black text-gold">
              لماذا نعتني بالتأكيد قبل الشحن؟
            </h2>

            <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">
              لأن تجربة فاخرة تبدأ بخدمة أوضح: نتصل بخطوات قصيرة، نؤكّد عنوانك
              وبياناتك، ثم نُغلّف طلبك وننجز التوصيل داخل المملكة مع الدفع عند
              الاستلام.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {[
                "جودة خامات ومظهر حضاري داخل المركبة",
                "سياسات واضحة ودعم سعودي",
                "رضاك يهمنا بعد التسليم أيضًا",
              ].map((x) => (
                <li key={x} className="flex gap-2 leading-relaxed">
                  <span className="shrink-0 text-gold">✦</span>

                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>

          {suggestionProducts.length > 0 && (
            <section className="space-y-4 text-right">
              <div>
                <h2 className="text-lg font-black text-white">قد يهمك أيضًا</h2>

                <p className="mt-1 text-xs font-semibold text-white/45">
                  قطع مختارة لمقصورة السيارة — تُشحن مع طلبك القادم
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {suggestionProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition hover:border-gold/45 hover:shadow-[0_24px_64px_-24px_rgba(201,162,77,0.45)]"
                  >
                    <div className="relative aspect-[4/5] bg-black/80 sm:aspect-[4/3]">
                      <Image
                        src={p.image}
                        alt={p.nameAr}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width:640px) 100vw,50vw"
                      />

                      {p.badge && (
                        <span className="absolute top-3 right-3 rounded-lg bg-gold px-2 py-1 text-[10px] font-black text-black shadow-lg">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2 border-t border-white/[0.08] p-4">
                      <p className="font-bold leading-snug text-white group-hover:text-gold">
                        {p.nameAr}
                      </p>

                      <p className="line-clamp-2 text-[11px] font-medium text-white/45">
                        {p.shortBenefit}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-lg font-black text-gold tabular-nums">
                          {formatMoney(p.price)}
                        </span>

                        <span className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-black text-black">
                          التفاصيل ←
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/shop"
                className="block rounded-xl bg-gold py-4 text-center text-base font-black text-black active:scale-[0.98]"
              >
                تصفّح المنتجات
              </Link>
            </section>
          )}

          <div className="pb-6 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-white/45 underline-offset-4 transition hover:text-gold hover:underline xs:text-sm"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
