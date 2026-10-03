import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer, FloatingEnquiry } from "@/components/layout/footer";
import { site } from "@/lib/site";
import { locales, activeLocale } from "@/lib/i18n";
import { Motion } from "@/components/animations/motion";
import "./globals.css";
const heading = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../node_modules/@fontsource/manrope/files/manrope-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff2",
      weight: "600",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});
const body = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
      weight: "600",
    },
  ],
  variable: "--font-body",
  display: "swap",
});
const editorial = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Abha Tourist Center — Somewhere above the ordinary",
    template: "%s | Abha Tourist Center",
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: "Abha Tourist Center",
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary", title: site.name, description: site.description },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={activeLocale} dir={locales[activeLocale].direction}>
      <body
        className={`${heading.variable} ${body.variable} ${editorial.variable}`}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Motion />
        <Header />
        {children}
        <Footer />
        <FloatingEnquiry />
      </body>
    </html>
  );
}
