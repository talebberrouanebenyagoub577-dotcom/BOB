import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata = { title: "سياسة الشحن | نيدها اوتو" };
export default function ShippingPage() {
  return (<><Header /><main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy"><h1 className="font-extrabold text-navy">سياسة الشحن</h1><p>نشحن إلى جميع مناطق المملكة العربية السعودية.</p><ul><li>مدة التوصيل: 2–5 أيام عمل</li><li>الشحن مجاني على جميع الطلبات</li><li>الدفع عند الاستلام لجميع الطلبات</li></ul></main><Footer /></>);
}
