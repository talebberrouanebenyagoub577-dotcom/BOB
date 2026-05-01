import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata = { title: "الدفع عند الاستلام | نيدها اوتو" };
export default function CodPage() {
  return (<><Header /><main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy"><h1 className="font-extrabold text-navy">الدفع عند الاستلام</h1><p>لا تحتاجين لبطاقة ائتمانية. ادفعي نقداً أو بالشبكة عند وصول طلبك.</p><ul><li>الدفع نقداً أو بطاقة مدى عند التوصيل</li><li>لا رسوم إضافية على الدفع عند الاستلام</li><li>تأكيد الطلب برقم جوالك فقط</li></ul></main><Footer /></>);
}
