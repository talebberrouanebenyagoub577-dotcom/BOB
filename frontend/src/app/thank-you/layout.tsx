import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تم استلام طلبك",
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
