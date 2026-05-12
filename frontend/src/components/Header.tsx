"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { BRAND } from "@/lib/brand";

export function Header() {
  const { items, openDrawer } = useCartStore();
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo — RTL start = right side */}
        <Link href="/" className="flex items-center gap-3 group" aria-label={`${BRAND.nameAr} — الرئيسية`}>
          <span className="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-black text-navy text-xl select-none group-hover:ring-2 group-hover:ring-gold-light/50 transition-shadow">
            N
          </span>
          <span className="font-extrabold text-lg leading-tight text-right">
            <span className="block text-white">{BRAND.nameAr}</span>
            <span className="block text-gold/90 text-[11px] font-semibold tracking-wide">
              {BRAND.nameEn}
            </span>
            <span className="hidden sm:block text-white/45 text-[10px] font-medium normal-case tracking-normal mt-0.5 max-w-[11rem]">
              {BRAND.taglineAr}
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
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

        {/* Cart button — LTR end = left side in RTL */}
        <button
          onClick={openDrawer}
          aria-label="السلة"
          className="relative flex items-center gap-2 bg-gold/20 hover:bg-gold/30 transition-colors rounded-xl px-3 py-2"
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
