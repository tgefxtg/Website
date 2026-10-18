import type { MetadataRoute } from "next";
import { getPlaces } from "@/lib/places";
import { site } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await getPlaces();
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
