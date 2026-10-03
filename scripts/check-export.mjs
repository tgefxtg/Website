import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const data = JSON.parse(fs.readFileSync("data/destinations.json", "utf8"));
const routes = [
  "",
  "destinations",
  "credits",
  ...data.map((d) => `destinations/${d.slug}`),
];
const problems = [];
for (const route of routes) {
  const file = path.join("out", route, "index.html");
  assert.ok(fs.existsSync(file), `Missing route ${route}`);
  const html = fs.readFileSync(file, "utf8");
  assert.equal(
    (html.match(/<h1\b/g) || []).length,
    1,
    `Expected one h1: ${route}`,
  );
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, `Missing canonical: ${route}`);
  assert.ok(
    html.includes('name="description"'),
    `Missing description: ${route}`,
  );
  for (const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
    const url = decodeURIComponent(match[1]);
    const target = path.join("out", url);
    if (!(
      fs.existsSync(target) || fs.existsSync(path.join(target, "index.html"))
    ))
      problems.push(`${route}: ${url}`);
  }
}
assert.deepEqual(
  problems,
  [],
  "Every internal route and initial asset must resolve",
);
assert.ok(fs.existsSync("out/sitemap.xml"));
assert.ok(fs.existsSync("out/robots.txt"));
const sitemap = fs.readFileSync("out/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, 33);
console.log(
  `Verified ${routes.length} page exports, their local links/assets, one h1 per page, canonical metadata, sitemap and robots.`,
);
