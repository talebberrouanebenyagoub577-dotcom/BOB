import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "سياسة الإرجاع" };

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy">
        <h1 className="font-extrabold text-navy">سياسة الإرجاع</h1>
        <p className="text-navy/70">
          نسعى لرضاك مع {BRAND.nameAr}. إذا لم يناسبك المنتج في الحدود التالية، يمكننا ترتيب
          الإرجاع وفق الشروط المعلنة في وقت الطلب.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>طلب الإرجاع خلال 7 أيام من استلام الطلب، والمنتج غير مستخدم وفي عبوته الأصلية حيث ينطبق ذلك.</li>
          <li>يُستثنى ما يتعارض مع التعليمات الصحية أو التالف بسبب سوء الاستخدام.</li>
          <li>للتنسيق، تواصل معنا عبر صفحة «تواصل معنا» مع رقم الطلب.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
