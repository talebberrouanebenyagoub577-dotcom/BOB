"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

const LOGO_PATH = "/brand/nidhamauto-logo.png";

/** شعار دائري — نفس الحجم المرئي للجوال والكمبيوتر ضمن الهيدر */
const LOGO_BOX =
  "h-11 w-11 sm:h-[2.75rem] sm:w-[2.75rem] md:h-12 md:w-12 lg:h-[3.25rem] lg:w-[3.25rem]";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        <Link
          href="/"
          className={`flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-navy ring-2 ring-gold/40 shadow-lg ${LOGO_BOX} py-0 group`}
          aria-label={`${BRAND.nameAr} — ${BRAND.nameEn} — الرئيسية`}
        >
          <Image
            src={LOGO_PATH}
            alt={`${BRAND.nameAr} — ${BRAND.nameEn}`}
            width={256}
            height={256}
            className="h-full w-full object-contain object-center transition-opacity group-hover:opacity-92"
            priority
            sizes="(max-width: 768px) 44px, 52px"
          />
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-semibold">
          <Link href="/shop" className="hover:text-gold transition-colors">
            المنتجات
          </Link>
          <Link href="/about" className="hover:text-gold transition-colors">
            من نحن
          </Link>
          <Link href="/contact" className="hover:text-gold transition-colors">
            تواصل معنا
          </Link>
        </nav>
      </div>
    </header>
  );
}
