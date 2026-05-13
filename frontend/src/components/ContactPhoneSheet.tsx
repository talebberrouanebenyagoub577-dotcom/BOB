import { BRAND, contactPhoneHref } from "@/lib/brand";

/** لوحة الرقم الموحَّد («ورقة بيضاء») — للتواصل الرسمي */
export function ContactPhoneSheet({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-navy/12 bg-white px-6 py-9 sm:px-10 shadow-md text-center ${className}`}
      aria-labelledby="official-phone-heading"
    >
      <p
        id="official-phone-heading"
        className="text-sm font-extrabold text-navy/50 mb-2"
      >
        الرقم الموحَّد للتواصل
      </p>
      <p className="text-navy/55 text-xs sm:text-sm mb-4 leading-relaxed max-w-md mx-auto">
        هذا هو الرقم الرسمي الوحيد في {BRAND.nameAr}. يمكنكم الضغط للاتصال مباشرة.
      </p>
      <a
        href={contactPhoneHref()}
        dir="ltr"
        translate="no"
        className="inline-block font-black text-navy tabular-nums text-2xl sm:text-[1.85rem] tracking-tight hover:text-gold transition-colors break-all"
      >
        {BRAND.contactPhoneIntl}
      </a>
    </section>
  );
}
