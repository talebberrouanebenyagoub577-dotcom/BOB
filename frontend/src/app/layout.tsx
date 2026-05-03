import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { PixelLoader } from "@/components/PixelLoader";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نيدها اوتو | Nidha Mauto",
  description: "منتجات السيارات للمرأة السعودية — COD — توصيل سريع",
  metadataBase: new URL("https://nidhamauto.shop"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>
        {children}
        <PixelLoader />
      </body>
    </html>
  );
}
