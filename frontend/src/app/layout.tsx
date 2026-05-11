import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "SubPay | Subscription Infrastructure for Africa",
  description: "Automate your subscriptions and recurring payments with SubPay.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >


      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>

  );
}
