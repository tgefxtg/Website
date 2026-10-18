import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePlace } from "../lib/place-validation.ts";
const valid = {
  name: "Mountain retreat",
  description: "A quiet mountain stop.",
  shortDescription: "A quiet stop.",
  location: "Abha",
  category: "Nature",
  image: "/media/123abc.webp",
  price: null,
  unit: "per person",
  revision: 0,
};
test("package prices support omitted and free prices, reject invalid amounts", () => {
  assert.equal(validatePlace(valid).price, null);
  assert.equal(validatePlace({ ...valid, price: 0 }).price, 0);
  for (const price of [-1, NaN, Infinity, "100", 1.001, 1000001])
    assert.throws(() => validatePlace({ ...valid, price }));
});
test("admin content requires bounded fields and safe local image references", () => {
  for (const image of [
    "https://example.com/photo.jpg",
    "javascript:alert(1)",
    "/media/file.svg",
    "/media/../private",
  ])
    assert.throws(() => validatePlace({ ...valid, image }));
  for (const patch of [
    { name: "" },
    { name: "x".repeat(121) },
    { description: "" },
    { category: "invalid" },
    { revision: -1 },
    { unit: "invalid" },
  ])
    assert.throws(() => validatePlace({ ...valid, ...patch }));
});
