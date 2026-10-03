import type { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";
import { site } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/destinations/`, priority: 0.9 },
    { url: `${site.url}/credits/`, priority: 0.2 },
    ...destinations.map((d) => ({
      url: `${site.url}/destinations/${d.slug}/`,
      priority: 0.8,
    })),
  ];
}
