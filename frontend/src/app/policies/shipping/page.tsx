import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "سياسة الشحن" };

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy">
        <h1 className="font-extrabold text-navy">سياسة الشحن</h1>
        <p className="text-navy/70">
          {BRAND.nameAr} يشحن الطلبات داخل المملكة العربية السعودية وفق الإطار التالي:
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>مدة التوصيل المتوقعة: 2–5 أيام عمل حسب المدينة وشركة الشحن.</li>
          <li>الشحن ضمن العرض الحالي كما هو مبيّن في صفحة الدفع أو إعلانات الموقع.</li>
          <li>الدفع عند الاستلام متاح لجميع الطلبات ما لم يُعلَن خلاف ذلك.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
