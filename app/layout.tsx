import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Starfield from "@/components/Starfield";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Astralya — Find Your Sign",
    template: "%s — Astralya",
  },
  description:
    "Astralya is a collectible plush character brand built around the zodiac. Find your sign, fall in love with the character, take them home.",
  openGraph: {
    type: "website",
    siteName: "Astralya",
    title: "Astralya — Find Your Sign",
    description:
      "A collectible plush character for every zodiac sign. Discover yours.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astralya — Find Your Sign",
    description:
      "A collectible plush character for every zodiac sign. Discover yours.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <Starfield />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1 relative">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
