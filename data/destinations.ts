import records from "./destinations.json";
export const categories = [
  "All",
  "Nature",
  "Mountains",
  "Heritage",
  "Family",
  "Farms",
  "Adventure",
  "Parks",
  "Waterfalls",
  "Dams",
  "Scenic Views",
  "Activities",
] as const;
export type Category = (typeof categories)[number];
export interface DestinationImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Destination {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  category: string;
  shortDescription: string;
  description: string;
  location: string | null;
  image: string | null;
  gallery: DestinationImage[];
  ticketPrice?: {
    amount: number;
    currency: string;
    unit: string;
    note?: string;
  };
  featured: boolean;
  packagePrice?: { amount: number; currency: string; unit: string };
  mapUrl: string | null;
  latitude?: number;
  longitude?: number;
  tags: string[];
  highlights: string[];
  sourcePage: number;
}
export const destinations: Destination[] = records;
export const featuredDestinations = destinations.filter((d) => d.featured);
export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}
