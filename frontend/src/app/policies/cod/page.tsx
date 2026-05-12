import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "الدفع عند الاستلام" };

export default function CodPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy">
        <h1 className="font-extrabold text-navy">الدفع عند الاستلام</h1>
        <p className="text-navy/70">
          {BRAND.nameAr} يعتمد وضعاً واضحاً: تتأكد من منتجك أولاً، ثم تدفع للمندوب عند التسليم — دون
          حاجة لبطاقة على الموقع.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>السداد نقداً أو بوسائل يقبلها مندوب التوصيل في وقت التسليم حسب المتاح.</li>
          <li>لا توجد رسوم خفية لخيار الدفع عند الاستلام ضمن السعر المعلن.</li>
          <li>يُطلب اسمك ورقم جوال سعودي صالح لإتمام الطلب وتأكيده.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
