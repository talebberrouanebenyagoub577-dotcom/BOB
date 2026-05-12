import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "سياسة الخصوصية" };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy">
        <h1 className="font-extrabold text-navy">سياسة الخصوصية</h1>
        <p className="text-navy/70">
          نحترم خصوصيتك ونلتزم بالحد الأدنى من جمع البيانات اللازم لتنفيذ طلبك عبر {BRAND.nameAr}.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>نجمع مثلًا الاسم ورقم الجوال وعنوان التوصيل لخدمة الشحن والتأكيد.</li>
          <li>لا نبيع بياناتك لأطراف ثالثة لأغراض تسويقية خارجية.</li>
          <li>يمكنك طلب تصحيح أو حذف بيانات الاتصال عبر قنوات الدعم المعتمدة لدينا.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
