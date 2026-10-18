import type { Metadata } from "next";
import { site } from "./site";
export const defaultImage = "/images/destinations/aseer-mountains.webp";
export function pageMetadata(title: string, description: string, path: string, image = defaultImage): Metadata {
  const url = `${site.url}${path}`;
  return { title, description, alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, siteName: site.name, images: [{ url: `${site.url}${image}`, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [`${site.url}${image}`] } };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
export function pageSchema(name: string, path: string) {
  return { "@context": "https://schema.org", "@type": "WebPage", "@id": `${site.url}${path}#webpage`, name, url: `${site.url}${path}`, isPartOf: { "@id": `${site.url}/#website` } };
}
