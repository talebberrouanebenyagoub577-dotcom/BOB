import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata = { title: "سياسة الإرجاع | نيدها اوتو" };
export default function ReturnsPage() {
  return (<><Header /><main className="max-w-2xl mx-auto px-4 py-12 prose prose-lg text-navy"><h1 className="font-extrabold text-navy">سياسة الإرجاع</h1><p>نضمن رضاكِ التام. إذا لم تكوني راضية عن منتجك:</p><ul><li>الإرجاع مجاني خلال 14 يوماً من الاستلام</li><li>يجب أن يكون المنتج في حالته الأصلية غير مستخدم</li><li>تواصلي معنا لترتيب الإرجاع</li></ul></main><Footer /></>);
}
