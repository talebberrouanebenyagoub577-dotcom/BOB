"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPopup } from "@/components/CheckoutPopup";
import { UpsellModal } from "@/components/UpsellModal";
import { PRODUCTS, UPSELL_PRICE } from "@/data/products";
import type { Product } from "@/types";
import { trackPurchase } from "@/lib/pixels";

const CALL_START_HOUR = 9;
const CALL_END_HOUR = 21; // exclusive — last calls before 21:00
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

export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [landedAt] = useState(() => new Date());

  useEffect(() => {
    const raw = sessionStorage.getItem("last_order");
    if (raw) {
      const data: OrderData = JSON.parse(raw);
      setOrder(data);
      trackPurchase(data.event_id, data.total, data.items.map((i) => i.sku));
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

  const suggestionProducts = useMemo((): Product[] => {
    if (!order) return PRODUCTS;
    const bought = new Set(order.items.map((i) => i.sku));
    if (order.upsell_accepted && order.upsell_sku) bought.add(order.upsell_sku);
    return PRODUCTS.filter((p) => !bought.has(p.sku));
  }, [order]);

  return (
    <>
      <Header />
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />

      <main className="min-h-screen bg-gradient-to-b from-navy/[0.04] via-cream to-cream pb-16">
        {/* High-confirmation banner */}
        <div className="bg-amber-500 text-navy px-4 py-3 shadow-md border-b border-amber-600/30">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 text-center sm:text-right">
            <span className="inline-flex items-center justify-center gap-2 font-black text-sm sm:text-base shrink-0">
              <span className="text-xl" aria-hidden>
                📵➜📞
              </span>
              مكالمة قد لا يظهر اسمنا عليها — الرجاء الرد
            </span>
            <span className="hidden sm:inline text-navy/50">|</span>
            <span className="font-bold text-sm sm:text-base leading-snug">
              نتصل لتأكيد عنوان الشحن وهويتك قبل الإرسال — الدفع عند الاستلام
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-10 space-y-8">
          {/* Hero */}
          <section className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-5xl ring-4 ring-emerald-200/80">
              ✅
            </div>
            <h1 className="font-black text-navy text-3xl md:text-4xl leading-tight">
              تم استلام طلبك — خطوة رائعة
            </h1>
            <p className="text-navy/65 text-base max-w-lg mx-auto leading-relaxed font-medium">
              فريق التأكيد سيتصل بك على الرقم الذي أدخلته عند الطلب لتأكيد التفاصيل
              ومناقشة عنوان التسليم قبل الشحن — لا نشارك بياناتك علناً ولن يظهر اسمك أو
              رقمك على هذه الشاشة.
            </p>
          </section>

          {order?.order_number && (
            <p className="rounded-2xl bg-navy/5 border border-navy/10 py-4 px-5 text-center">
              <span className="text-navy/60 font-semibold text-sm">رقم مرجعي للطلب</span>
              <br />
              <span className="font-black text-navy text-xl tracking-wide">
                #{order.order_number}
              </span>
            </p>
          )}

          {/* Window-specific call promise */}
          <section
            className={`rounded-2xl p-5 md:p-6 border-2 ${
              inCallWindow
                ? "bg-emerald-50 border-emerald-200"
                : "bg-indigo-50 border-indigo-100"
            }`}
          >
            {inCallWindow ? (
              <>
                <p className="font-black text-navy text-lg mb-2">
                  📞 انتظر مكالمتنا خلال أقل من ١٠ دقائق
                </p>
                <p className="text-navy/75 text-sm leading-relaxed mb-4">
                  ساعات التأكيد الهاتفي: من ٩ صباحاً إلى ٩ مساءً بتوقيت الرياض.
                  المتصل سيؤكد معك عنوان التوصيل بالكامل — ردّي على أي رقم حتى لو لم
                  يظهر اسم الشركة؛ هذا طبيعي ومقصود لتقليل الإزعاج.
                </p>
                <div className="rounded-xl bg-white/90 border border-emerald-200/80 p-4 text-center shadow-sm">
                  <p className="text-navy/55 text-xs font-bold mb-1 uppercase tracking-wide">
                    أقصى مدة لمكالمة التأكيد (تقديراً)
                  </p>
                  <p className="text-4xl font-black text-emerald-600 tabular-nums">
                    {minutes}:{seconds}
                  </p>
                  <p className="text-navy/45 text-xs mt-2 font-medium">
                    خلّي الجوال خارج الوضع الصامت — المكالمة قصيرة وواضحة
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="font-black text-navy text-lg mb-2">
                  🌙 طلبك مسجّل — أول اتصال في الصباح الباكر
                </p>
                <p className="text-navy/75 text-sm leading-relaxed">
                  خارج ساعات المكالمات (٩ ص–٩ م بتوقيت الرياض). ستصلك مكالتنا ضمن أوّل
                  جولة اتصالات صباح الغد لتأكيد الطلب والعنوان قبل الشحن — نفس التنبيه:
                  الرقم قد يظهر بدون اسم تطبيق؛ نرجو الرد لإكمال تأكيدك.
                </p>
              </>
            )}
          </section>

          {/* Timeline */}
          <section className="bg-white rounded-2xl border border-navy/10 p-6 shadow-sm text-right space-y-4">
            <h2 className="font-black text-navy text-lg">ماذا يحدث خطوة بخطوة؟</h2>
            <ul className="space-y-3">
              {[
                "اتصال قصير: نؤكد المنتج، الكمية، والعنوان الكامل لتفادي تأخير الشحن.",
                "تجهيز سريع: بعد التأكيد نبدأ تعبئة طلبك بعناية.",
                "توصيل خلال ٢–٥ أيام عمل — تدفعين نقداً عند الباب بدون بطاقة مسبقة.",
              ].map((t, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-gold/25 text-navy font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-navy/75 text-sm leading-relaxed">{t}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Order summary — breathable layout */}
          {order && lineRows.length > 0 && (
            <section className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden text-right">
              <div className="bg-navy px-5 py-3 flex items-center justify-between">
                <h2 className="font-black text-white">ملخص الطلب</h2>
                <span className="text-gold text-xs font-bold">الدفع عند الاستلام</span>
              </div>
              <div className="divide-y divide-navy/[0.08] px-5 py-1">
                {lineRows.map((row) => (
                  <div
                    key={row.key}
                    className="py-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {row.tag && (
                          <span className="text-[10px] font-black uppercase bg-gold/20 text-navy px-2 py-0.5 rounded-md">
                            {row.tag}
                          </span>
                        )}
                        <p className="font-bold text-navy text-base leading-snug text-right">
                          {row.title}
                        </p>
                      </div>
                      <p className="text-navy/45 text-xs font-medium">{row.subtitle}</p>
                    </div>
                    <p className="font-black text-gold text-lg shrink-0 sm:pt-0.5 tabular-nums text-left">
                      {formatMoney(row.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-navy/[0.04] px-5 py-4 flex items-center justify-between border-t border-navy/10">
                <span className="font-black text-navy">الإجمالي المستحق عند التسليم</span>
                <span className="font-black text-2xl text-gold tabular-nums">
                  {formatMoney(order.total)}
                </span>
              </div>
            </section>
          )}

          {/* Excitement / outcome */}
          <section className="rounded-2xl bg-navy text-white p-6 md:p-7 space-y-4 text-right">
            <h2 className="font-black text-xl text-gold">لماذا ستفرحين بالمنتج وليس بالتوصيل فقط؟</h2>
            <p className="text-white/85 text-sm leading-relaxed font-medium">
              نختار قطع عملية تُقلّل الفوضى والتوتر اليومي داخل السيارة — من تنظيم
              ظهر المقعد إلى تجنّب ضياع الأغراض في فتحة المقعد ورؤية أوضح عند
              الاصطفاف. بعد التثبيت، غالب عميلاتنا يلمسن الفرق من أول أسبوع.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              {[
                "تجربة قيادة أهدأ — أغراضك في أماكنها بدل مرميات المقعد.",
                "جودة خامات تناسب حر الصيف داخل المركبة.",
                "سياسات واضحة: تأكيد هاتفي، ثم توصيل ودفع عند الاستلام.",
              ].map((x) => (
                <li key={x} className="flex gap-2 justify-end items-start">
                  <span>{x}</span>
                  <span className="text-gold shrink-0">✦</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Social proof */}
          <section className="rounded-2xl border-2 border-gold/30 bg-white p-6 text-center space-y-3 shadow-sm">
            <p className="font-black text-navy text-lg">انضمي لآلاف العميلات السعيدات</p>
            <p className="text-navy/65 text-sm max-w-md mx-auto leading-relaxed">
              متوسط تقييماتنا فوق{" "}
              <span className="text-gold font-black">٤،٩/٥</span> — عميلات من الرياض وجدة
              والدمّام يثقن بالدفع عند الاستلام والتأكيد الهاتفي السريع.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {["دفع عند الاستلام", "شحن خلال أيام عمل", "تأكيد قبل الشحن"].map((c) => (
                <span
                  key={c}
                  className="text-xs font-bold bg-navy/5 text-navy rounded-full px-3 py-1.5 border border-navy/10"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </section>

          {/* Product suggestions */}
          {suggestionProducts.length > 0 && (
            <section className="text-right space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-black text-navy text-xl">أضيفي لسيارتك مع طلبك القادم</h2>
                <p className="text-navy/50 text-sm font-medium">
                  قطع مكمّلة باقتراح ذكي — عرض واحد نشيطة فيه
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestionProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group bg-white rounded-2xl border border-navy/10 overflow-hidden shadow-sm hover:shadow-md hover:border-gold/40 transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-navy/5">
                      <Image
                        src={p.image}
                        alt={p.nameAr}
                        fill
                        className="object-contain p-4 group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width:640px) 100vw, 50vw"
                      />
                      {p.badge && (
                        <span className="absolute top-2 right-2 text-[10px] font-black bg-gold text-white px-2 py-1 rounded-lg shadow">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 gap-2 border-t border-navy/5">
                      <p className="font-bold text-navy group-hover:text-gold transition-colors leading-snug">
                        {p.nameAr}
                      </p>
                      <p className="text-navy/55 text-xs line-clamp-2">{p.shortBenefit}</p>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="font-black text-gold text-lg">{formatMoney(p.price)}</span>
                        <span className="text-xs font-black text-white bg-navy rounded-lg px-3 py-1.5 group-hover:bg-navy/90">
                          عرض التفاصيل ←
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/shop"
                className="block btn-navy text-center text-base py-4 !rounded-xl"
              >
                تصفّحي كل المنتجات
              </Link>
            </section>
          )}

          <div className="text-center pb-8">
            <Link href="/" className="text-navy/50 hover:text-navy font-bold text-sm underline-offset-4 hover:underline">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
