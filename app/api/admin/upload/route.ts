import { env } from "cloudflare:workers";
import { isOwner, sameOrigin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await isOwner()))
    return Response.json(
      { error: "Please sign in as the owner." },
      { status: 403 },
    );
  if (!env.BUCKET)
    return Response.json(
      { error: "Image storage unavailable." },
      { status: 503 },
    );
  const max = 8 * 1024 * 1024;
  if (Number(request.headers.get("content-length")) > max)
    return Response.json(
      { error: "Choose an image smaller than 8 MB." },
      { status: 413 },
    );
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Choose a photo." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      return Response.json(
        { error: "Choose an image smaller than 8 MB." },
        { status: 413 },
      );
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const type = request.headers.get("content-type");
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  const ext =
    type === "image/jpeg" && jpg
      ? "jpg"
      : type === "image/png" && png
        ? "png"
        : type === "image/webp" && webp
          ? "webp"
          : null;
  if (!ext)
    return Response.json(
      { error: "Use a JPG, PNG or WebP photo." },
      { status: 400 },
    );
  const key = `${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: type! } });
  return Response.json(
    { url: `/media/${key}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}
