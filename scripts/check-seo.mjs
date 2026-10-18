import { writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:4175';
const canonicalBase = 'https://abha-tourist-center.shoneclg.chatgpt.site';
const failures = [], pages = [], resources = new Set();
const check = (ok, message) => { if (!ok) failures.push(message); };
const robots = await fetch(`${base}/robots.txt`);
check(robots.status === 200 && (await robots.text()).includes(`${canonicalBase}/sitemap.xml`), 'robots/sitemap reference');
const sitemap = await fetch(`${base}/sitemap.xml`);
const xml = await sitemap.text();
check(sitemap.status === 200 && xml.includes('<urlset'), 'sitemap XML');
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]);
check(urls.length >= 32 && new Set(urls).size === urls.length, 'sitemap URL count/duplicates');
const titles = new Set(), descriptions = new Set();
for (const url of urls) {
  check(url.startsWith(canonicalBase) && !url.includes('/admin'), `eligible canonical ${url}`);
  const path = new URL(url).pathname;
  const r = await fetch(`${base}${path}`), html = await r.text();
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  check(r.status === 200, `status ${path}: ${r.status}`);
  check(!!title && !titles.has(title), `unique title ${path}`); titles.add(title);
  check(!!description && !descriptions.has(description), `unique description ${path}`); descriptions.add(description);
  check(canonical?.replace(/\/$/, '') === url.replace(/\/$/, ''), `canonical ${path}: ${canonical}`);
  check((html.match(/<h1[\s>]/g) || []).length === 1, `one h1 ${path}`);
  check(!/<meta name="robots" content="[^"]*noindex/.test(html), `indexable ${path}`);
  check(html.includes('og:image') && html.includes('twitter:card'), `social metadata ${path}`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(m[1]); } catch { failures.push(`JSON-LD ${path}`); }
  }
  for(const m of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
    if (!/^\/(?:admin|signin|signout|_next)/.test(m[1])) resources.add(m[1]);
  }
  pages.push({path,status:r.status,title,description,canonical});
}
for(const path of resources) { const r=await fetch(`${base}${path}`); check(r.status===200,`internal resource ${path}: ${r.status}`); await r.body?.cancel(); }
for(const path of ['/not-a-real-page/','/destinations/not-a-real-place/']) {
  const r=await fetch(`${base}${path}`); check(r.status===404,`404 ${path}: ${r.status}`); await r.body?.cancel();
}
for(const path of ['/api/admin/places','/api/admin/upload']) {
  const r=await fetch(`${base}${path}`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});
  check(r.status===403,`anonymous write denied ${path}`);
  check(r.headers.get('x-robots-tag')?.includes('noindex'),`API noindex ${path}`);
}
const admin=await fetch(`${base}/admin/`);check((await admin.text()).includes('noindex'),'admin noindex');
const result={base,pages,resourceCount:resources.size,failures};
await writeFile(process.argv[3] || 'tmp/seo-check.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({pages:pages.length,resources:resources.size,failures}));
process.exitCode=failures.length?1:0;
