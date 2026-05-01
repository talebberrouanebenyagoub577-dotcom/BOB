import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata = { title: "الشروط والأحكام | نيدها اوتو" };
export default function TermsPage() {
  return (<><Header /><main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy"><h1 className="font-extrabold text-navy">الشروط والأحكام</h1><p>باستخدام موقعنا وإتمام طلبك، فإنك توافقين على الشروط التالية:</p><ul><li>الطلبات ملزمة بعد تأكيد الموظف هاتفياً</li><li>نيدها اوتو غير مسؤولة عن التأخير الناجم عن شركة الشحن</li><li>جميع الأسعار بالريال السعودي وشاملة الضريبة</li></ul></main><Footer /></>);
}
