import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  whatsappUrl,
  destinationMessage,
  tripMessage,
  WHATSAPP_NUMBER,
} from "../lib/whatsapp.ts";
const data = JSON.parse(
  readFileSync(new URL("../data/destinations.json", import.meta.url), "utf8"),
);
test("30 distinct destinations retain source page references and valid local image variants", () => {
  assert.equal(data.length, 30);
  assert.equal(new Set(data.map((d: any) => d.slug)).size, 30);
  for (const d of data) {
    assert.ok(d.sourcePage >= 2 && d.sourcePage <= 30);
    assert.ok(d.description);
    for (const photo of d.gallery)
      for (const w of [320, 480, 640, 960, 1280, 1920])
        assert.ok(
          existsSync(`public${photo.src.replace(".webp", `-${w}.webp`)}`),
          photo.src,
        );
    if (d.mapUrl) assert.equal(new URL(d.mapUrl).hostname, "maps.app.goo.gl");
  }
  assert.equal(
    data.find((d: any) => d.slug === "silent-valley-hills").image,
    null,
  );
  assert.equal(
    data.find((d: any) => d.slug === "the-summer-gathering").mapUrl,
    null,
  );
});
test("reference fees remain accurate and absent for unpriced places", () => {
  const prices = data
    .filter((d: any) => d.ticketPrice)
    .map((d: any) => [d.slug, d.ticketPrice.amount]);
  assert.deepEqual(prices, [
    ["rose-garden", 25],
    ["the-vineyard", 20],
    ["mazra-thoth-aswad", 15],
    ["al-muftaha-art-village", 30],
  ]);
});
test("WhatsApp URLs encode Arabic, emoji, ampersands and newlines for the correct number", () => {
  for (const d of data) {
    const msg = destinationMessage(d.name);
    const url = new URL(whatsappUrl(msg));
    assert.equal(url.hostname, "wa.me");
    assert.equal(url.pathname, `/${WHATSAPP_NUMBER}`);
    assert.equal(url.searchParams.get("text"), msg);
  }
  const msg = tripMessage(["Nature", "Heritage"], ["جبل ثاة", "A & B"]);
  assert.equal(new URL(whatsappUrl(msg)).searchParams.get("text"), msg);
  assert.ok(tripMessage([], []).includes("Please recommend"));
});
