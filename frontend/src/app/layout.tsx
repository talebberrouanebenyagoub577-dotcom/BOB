import type { Metadata } from "next";
import { Suspense } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import { PixelLoader } from "@/components/PixelLoader";
import { RouteAnalytics } from "@/components/RouteAnalytics";

import { BRAND, defaultSiteTitle } from "@/lib/brand";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: defaultSiteTitle(),
    template: `%s | ${BRAND.nameAr}`,
  },
  description: BRAND.metaDescriptionAr,
  metadataBase: new URL(BRAND.domain),
  openGraph: {
    title: defaultSiteTitle(),
    description: BRAND.metaDescriptionAr,
    locale: "ar_SA",
    siteName: BRAND.nameAr,
    type: "website",
    url: BRAND.domain,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>
        <Suspense fallback={null}>
          <RouteAnalytics />
        </Suspense>
        {children}
        <PixelLoader />
      </body>
    </html>
  );
}
