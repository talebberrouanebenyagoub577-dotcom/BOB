import type { Metadata } from "next";
import "./globals.css";
import { PixelLoader } from "@/components/PixelLoader";

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
    <html lang="ar" dir="rtl">
      <body className="font-cairo">
        {children}
        <PixelLoader />
      </body>
    </html>
  );
}
