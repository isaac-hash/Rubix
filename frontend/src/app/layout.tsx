import type { Metadata } from "next";
import { Outfit, Instrument_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
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
      className={`${outfit.variable} ${instrumentSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >

      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>

  );
}
