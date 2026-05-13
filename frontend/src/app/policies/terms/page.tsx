import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactPhoneSheet } from "@/components/ContactPhoneSheet";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "الشروط والأحكام" };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy">
        <h1 className="font-extrabold text-navy">الشروط والأحكام</h1>
        <p>
          باستخدامك لموقع {BRAND.domain.replace("https://", "")} وإتمام طلبك، فإنك توافق على
          الشروط التالية الخاصة بـ {BRAND.nameAr}.
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>تُنشأ العلاقة التعاقدية بعد تأكيد الطلب مع فريقنا (مثلاً اتصالاً) وحيث ينطبق ذلك.</li>
          <li>
            {BRAND.nameAr} غير مسؤولة عن التأخير الناجم عن شركة الشحن أو ظروف خارجة عن إرادتنا، مع
            التزامنا بالمتابعة معك بحسن نية.
          </li>
          <li>جميع الأسعار المعروضة بالريال السعودي كما هو موضح في صفحة الدفع، ما لم يُعلَن غير ذلك.</li>
          <li>
            الرقم الموحَّد لتأكيد الطلبات أو الاستفسارات الرسمية هو الرقم الموضَّح في اللوحة أدناه،
            ولا نستخدم لهذا الغرض أرقامًا بديلة في الوثائق الرسمية.
          </li>
        </ul>

        <div className="not-prose my-10">
          <ContactPhoneSheet />
        </div>
      </main>
      <Footer />
    </>
  );
}
