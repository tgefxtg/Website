import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer, FloatingEnquiry } from "@/components/layout/footer";
import { site } from "@/lib/site";
import { pageMetadata, jsonLd } from "@/lib/seo";
import { locales, activeLocale } from "@/lib/i18n";
import { Motion } from "@/components/animations/motion";
import "./globals.css";
import "../styles/admin.css";
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
  ...pageMetadata("Abha & Aseer Travel Guide | Abha Tourist Center", site.description, "/"),
  metadataBase: new URL(site.url),
  title: {
    default: "Abha & Aseer Travel Guide | Abha Tourist Center",
    template: "%s | Abha Tourist Center",
  },
  description: site.description,
  alternates: { canonical: "/" },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: `${site.url}/`, telephone: "+966536493716" },
          { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: `${site.url}/`, publisher: { "@id": `${site.url}/#organization` } }
        ] }) }} />
        <Header />
        {children}
        <Footer />
        <FloatingEnquiry />
      </body>
    </html>
  );
}
