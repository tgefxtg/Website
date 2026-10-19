import { env } from "cloudflare:workers";
import { isOwner, sameOrigin } from "@/lib/admin-auth";
import { getPlace, getDeletedPlaces } from "@/lib/places";
import { validatePlace } from "@/lib/place-validation";
import { boundedText } from "@/lib/request-body";
export async function PATCH(request: Request) {
  if (!sameOrigin(request) || !(await isOwner()))
    return Response.json({ error: "Please sign in as the owner." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Storage unavailable." }, { status: 503 });
  try {
    const { slug, revision } = JSON.parse(await boundedText(request));
    if (typeof slug !== "string" || !Number.isSafeInteger(revision) || revision < 1)
      return Response.json({ error: "Invalid place data." }, { status: 400 });
    const record = (await getDeletedPlaces()).find(p => p.slug === slug);
    if (!record) return Response.json({ error: "Deleted package not found." }, { status: 404 });
    if (record.revision !== revision) return Response.json({ error: "This package changed. Reload before restoring." }, { status: 409 });
    const restored = { ...record, deleted: false };
    const result = await env.DB.prepare("UPDATE places SET content=?, revision=revision+1 WHERE slug=? AND revision=?").bind(JSON.stringify(restored), slug, revision).run();
    if (result.meta.changes !== 1) return Response.json({ error: "This package changed. Reload before restoring." }, { status: 409 });
    return Response.json({ place: { ...restored, revision: revision + 1 } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Could not restore this package." }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request) || !(await isOwner()))
    return Response.json({ error: "Please sign in as the owner." }, { status: 403 });
  if (!env.DB)
    return Response.json({ error: "Storage unavailable." }, { status: 503 });
  try {
    const { slug, revision } = JSON.parse(await boundedText(request));
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(slug) ||
        !Number.isSafeInteger(revision) || revision < 0)
      return Response.json({ error: "Invalid place data." }, { status: 400 });
    const existing = await getPlace(slug);
    if (!existing) return Response.json({ error: "Place not found." }, { status: 404 });
    if (existing.revision !== revision)
      return Response.json({ error: "This place changed in another window. Reload before deleting." }, { status: 409 });
    // Retain the record and photos for recovery; public reads omit the tombstone.
    const content = JSON.stringify({ ...existing, deleted: true });
    const result = revision === 0
      ? await env.DB.prepare("INSERT OR IGNORE INTO places(slug,content,revision) VALUES(?,?,1)").bind(slug, content).run()
      : await env.DB.prepare("UPDATE places SET content=?, revision=revision+1 WHERE slug=? AND revision=?").bind(content, slug, revision).run();
    if (result.meta.changes !== 1)
      return Response.json({ error: "This place changed in another window. Reload before deleting." }, { status: 409 });
    return Response.json({ deleted: slug }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not delete this package. Please try again." }, { status: 400 });
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "Request origin rejected." },
      { status: 403 },
    );
  if (!(await isOwner()))
    return Response.json(
      { error: "Please sign in as the owner." },
      { status: 403 },
    );
  if (!env.DB || !env.BUCKET)
    return Response.json({ error: "Storage unavailable." }, { status: 503 });
  try {
    const body = await boundedText(request);
    const input = JSON.parse(body),
      value = validatePlace(input);
    const slug =
      input.slug === ""
        ? `${
            value.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 65) || "place"
          }-${crypto.randomUUID().slice(0, 8)}`
        : input.slug;
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,100}$/.test(slug))
      throw new Error("Invalid place link.");
    const existing = await getPlace(slug);
    if (input.slug && !existing)
      return Response.json({ error: "Place not found." }, { status: 404 });
    if (existing && existing.revision !== value.revision)
      return Response.json(
        {
          error:
            "This place changed in another window. Reload before editing again.",
        },
        { status: 409 },
      );
    if (
      value.image.startsWith("/media/") &&
      !(await env.BUCKET.head(value.image.slice(7)))
    )
      throw new Error("Upload the photo again.");
    if (value.image.startsWith("/images/") && value.image !== existing?.image)
      throw new Error("Upload a new photo to change the image.");
    const { price, unit, revision, ...fields } = value;
    const record = {
      ...existing,
      ...fields,
      slug,
      id: existing?.id ?? slug,
      featured: existing?.featured ?? false,
      mapUrl: existing?.mapUrl ?? null,
      sourcePage: existing?.sourcePage ?? 0,
      tags: [
        ...new Set([
          value.category,
          ...(existing?.tags.filter((t) => t !== existing.category) ?? []),
        ]),
      ],
      highlights: existing?.highlights ?? [],
      gallery:
        existing?.image === value.image
          ? existing.gallery.map((photo, index) => index === 0 ? { ...photo, alt: value.name } : photo)
          : [
              { src: value.image, alt: value.name, width: 1920, height: 1280 },
              ...(existing?.gallery.slice(1) ?? []),
            ],
      packagePrice:
        price === null ? undefined : { amount: price, currency: "SAR", unit },
    };
    const content = JSON.stringify(record);
    const result =
      revision === 0
        ? await env.DB.prepare(
            "INSERT OR IGNORE INTO places(slug,content,revision) VALUES(?,?,1)",
          )
            .bind(slug, content)
            .run()
        : await env.DB.prepare(
            "UPDATE places SET content=?, revision=revision+1 WHERE slug=? AND revision=?",
          )
            .bind(content, slug, revision)
            .run();
    if (result.meta.changes !== 1)
      return Response.json(
        {
          error:
            "This place changed in another window. Reload before editing again.",
        },
        { status: 409 },
      );
    return Response.json(
      { place: { ...record, revision: revision + 1 } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof SyntaxError
            ? "Invalid place data."
            : error instanceof Error
              ? error.message
              : "Could not save this place.",
      },
      { status: 400 },
    );
  }
}
