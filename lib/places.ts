import { env } from "cloudflare:workers";
import { cache } from "react";
import {
  destinations as original,
  type Destination,
} from "@/data/destinations";
export type ManagedPlace = Destination & { revision: number };
export const getPlaces = cache(async (): Promise<ManagedPlace[]> => {
  if (!env.DB) throw new Error("Place storage is unavailable");
  const { results } = await env.DB.prepare(
    "SELECT content, revision FROM places ORDER BY rowid",
  ).all<{ content: string; revision: number }>();
  const merged = new Map<string, ManagedPlace>(
    original.map((d) => [d.slug, { ...d, revision: 0 }]),
  );
  for (const row of results) {
    const d = JSON.parse(row.content);
    // Keep a tombstone so deleting a bundled destination cannot resurrect it.
    if (d.deleted === true) {
      merged.delete(d.slug);
      continue;
    }
    merged.set(d.slug, { ...d, revision: row.revision });
  }
  return [...merged.values()];
});
export async function getPlace(slug: string) {
  return (await getPlaces()).find((d) => d.slug === slug);
}
