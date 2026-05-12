"use client";

import Link from "next/link";
import { trackServerEvent } from "@/lib/serverTrack";

export function HeroTrackLinks() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
      <Link
        href="/shop"
        onClick={() => trackServerEvent("cta_click", { place: "hero", target: "/shop" })}
        className="inline-block bg-gold text-white font-extrabold text-lg px-8 py-4 rounded-xl hover:bg-gold-light transition-colors text-center"
      >
        اكتشف المجموعة ←
      </Link>
      <Link
        href="/about"
        onClick={() => trackServerEvent("cta_click", { place: "hero", target: "/about" })}
        className="inline-block border border-white/30 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-center"
      >
        من نحن
      </Link>
    </div>
  );
}
