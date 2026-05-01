import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy text-white/70 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <p className="font-extrabold text-white text-base mb-2">نيدها اوتو</p>
          <p className="leading-relaxed">
            منتجات السيارات للمرأة السعودية. الدفع عند الاستلام. توصيل سريع.
          </p>
        </div>

        {/* Pages */}
        <div>
          <p className="font-bold text-white mb-3">روابط سريعة</p>
          <ul className="space-y-2">
            <li><Link href="/shop" className="hover:text-gold transition-colors">المنتجات</Link></li>
            <li><Link href="/about" className="hover:text-gold transition-colors">من نحن</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">تواصلي معنا</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <p className="font-bold text-white mb-3">السياسات</p>
          <ul className="space-y-2">
            <li><Link href="/policies/shipping" className="hover:text-gold transition-colors">سياسة الشحن</Link></li>
            <li><Link href="/policies/returns" className="hover:text-gold transition-colors">سياسة الإرجاع</Link></li>
            <li><Link href="/policies/cod" className="hover:text-gold transition-colors">الدفع عند الاستلام</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-gold transition-colors">الخصوصية</Link></li>
            <li><Link href="/policies/terms" className="hover:text-gold transition-colors">الشروط والأحكام</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-xs">
        © {new Date().getFullYear()} نيدها اوتو — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
