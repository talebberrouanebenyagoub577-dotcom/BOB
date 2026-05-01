import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "من نحن | نيدها اوتو" };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-14 space-y-10">
        <div className="text-center">
          <h1 className="font-extrabold text-navy text-4xl mb-4">من نحن</h1>
          <p className="text-navy/60 text-lg">
            نيدها اوتو — لأن قيادتك تستحق الراحة والتنظيم
          </p>
        </div>

        <div className="bg-navy text-white rounded-2xl p-8 space-y-4">
          <h2 className="font-extrabold text-gold text-2xl">قصتنا</h2>
          <p className="leading-relaxed text-white/80">
            بدأت فكرة نيدها اوتو من إدراك حقيقي — المرأة السعودية التي حصلت على حق القيادة
            تستحق منتجات مصممة لاحتياجاتها الفعلية. لا تعديل، لا تنازل — منتجات من
            الأساس لها.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { num: "+2,400", label: "عميلة سعيدة" },
            { num: "4.9/5", label: "متوسط التقييم" },
            { num: "3", label: "منتجات متخصصة" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gold/10 rounded-2xl p-5">
              <p className="font-black text-gold text-2xl">{stat.num}</p>
              <p className="text-navy font-semibold text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-navy text-2xl">قيمنا</h2>
          {[
            { icon: "🎯", title: "تصميم هادف", text: "كل منتج يحل مشكلة حقيقية في حياة القائدة السعودية" },
            { icon: "✨", title: "جودة لا تُساوَم", text: "نختار المواد بعناية لتدوم طويلاً" },
            { icon: "💛", title: "ثقة مكتسبة", text: "نبني علاقة طويلة الأمد مع كل عميلة" },
          ].map((v) => (
            <div key={v.title} className="flex gap-4 p-4 bg-navy/5 rounded-xl">
              <span className="text-3xl">{v.icon}</span>
              <div>
                <p className="font-bold text-navy">{v.title}</p>
                <p className="text-navy/60 text-sm mt-0.5">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
