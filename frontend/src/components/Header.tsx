"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { BRAND } from "@/lib/brand";

const LOGO_PATH = "/brand/nidhamauto-logo.png";

/** شعار دائري — نفس الحجم المرئي للجوال والكمبيوتر ضمن الهيدر */
const LOGO_BOX =
  "h-11 w-11 sm:h-[2.75rem] sm:w-[2.75rem] md:h-12 md:w-12 lg:h-[3.25rem] lg:w-[3.25rem]";

export function Header() {
  const { items, openDrawer } = useCartStore();
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

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

        <button
          type="button"
          onClick={openDrawer}
          aria-label="السلة"
          className="relative flex items-center gap-2 bg-gold/20 hover:bg-gold/30 transition-colors rounded-xl px-2.5 sm:px-3 py-2 shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -left-2 bg-gold text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
