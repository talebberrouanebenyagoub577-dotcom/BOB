import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata = { title: "سياسة الخصوصية | نيدها اوتو" };
export default function PrivacyPage() {
  return (<><Header /><main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy"><h1 className="font-extrabold text-navy">سياسة الخصوصية</h1><p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p><ul><li>نجمع الاسم ورقم الجوال فقط لأغراض التوصيل</li><li>لا نشارك بياناتك مع أطراف ثالثة بدون إذنك</li><li>يمكنك طلب حذف بياناتك في أي وقت</li></ul></main><Footer /></>);
}
