# SEO implementation report

Date: 2026-10-19. Site: https://abha-tourist-center.shoneclg.chatgpt.site/

## Initial audit and priorities

- Critical: production was private, preventing anonymous crawling. Public visitor access is authorized; owner editing remains restricted server-side.
- High: incomplete page-specific sharing metadata and breadcrumbs; no explicit API noindex headers; redundant destination database reads.
- High: Vinext image behavior did not reliably honor the existing loader/srcset configuration. Replaced Photo's framework wrapper with explicit native responsive image markup using existing WebP variants.
- High: React server component package advisory. React, React DOM and react-server-dom-webpack patched together from 19.2.6 to 19.2.9.
- Medium: low-contrast animated headings/body text, accessible-name mismatches, missing reduced-motion handling, stale 404 destination count.
- Low: missing keyword map and Search Console owner instructions.

## Implemented

- Shared per-page canonical, Open Graph and Twitter large-image metadata. Existing names and slugs preserved; no mass-generated content or new business claims.
- Organization/WebSite entities with stable IDs; homepage and collection WebPage schema; destination WebPage, TouristAttraction and BreadcrumbList graphs. Safe JSON serialization. Visible destination breadcrumbs.
- Sitemap stays synchronized with database content; no invented lastmod. Robots allows public content and admin-page crawling so noindex is visible, while administrative API crawling is excluded. Authentication protects writes independently of robots.
- Admin and error responses have X-Robots-Tag noindex and private/no-store; Worker responses receive nosniff and strict-origin-when-cross-origin referrer policy. No restrictive CSP or frame policy that could break hosted login.
- React request-scoped caching deduplicates destination reads; no persistent cache delays admin changes. Renamed places update primary-photo alt text.
- Responsive WebP srcset/sizes, reserved image geometry, eager/high-priority hero and lazy below-fold images; animation runtime loaded on demand. Reduced-motion users avoid cinematic animation initialization, including on preference changes.
- Clear Abha/Aseer homepage and collection headings, improved muted text contrast and animated text contrast; natural visible labels used for gallery and brand controls.

## Important files

Metadata and schema: lib/seo.ts, app/layout.tsx, app/page.tsx, app/destinations/page.tsx, app/destinations/[slug]/page.tsx, app/credits/page.tsx. Access headers: build/sites-worker.ts and app/robots.ts. Data: lib/places.ts and app/api/admin/places/route.ts. Images/motion/accessibility: components/ui/photo.tsx, components/ui/gallery.tsx, components/layout/brand.tsx, components/home/hero.tsx, components/animations/*, styles/editorial.css. Regression checks: scripts/check-seo.mjs and tests/owner-access.test.ts.

## URL and indexing strategy

Canonical origin is the current HTTPS Sites domain. Public content uses self-referencing canonicals with trailing slashes; existing destination slugs are unchanged. Search/category filters are client-side states and do not create new indexable URLs. No www domain is configured or invented. Sitemap: /sitemap.xml. Robots: /robots.txt. Admin is noindex and owner-only. No changes to database schema or API request contracts.

## Verified checks before publication

- TypeScript passes; six automated tests pass, including owner replacement, old-account denial, anonymous denial and origin checks.
- Production build passes. Local crawl passes for 33 pages (32 production pages plus one existing local test place), 137 linked resources, unique titles/descriptions, canonical tags, one H1, metadata, parseable JSON-LD, robots/sitemap, real 404 status codes and anonymous API rejection with noindex headers.
- Production database inspection found no edited place overrides; all 29 original destination records remain. Local test records are not deployed.
- Live owner dashboard access and saving were verified in the existing John Raj session. High City was saved with unchanged fields; the UI confirmed the save. Live upload acceptance was not exercised; local upload checks and live anonymous upload rejection passed.
- Google Rich Results Test, Search Console verification and sitemap submission have not been completed. JSON-LD parsing does not establish Google rich-result eligibility.

## Performance measurements

Single Lighthouse CLI runs against the built Worker on localhost, same machine and default mobile/desktop profiles using headless Edge. These are lab measurements, not field INP or CrUX results. Hosting/network behavior can differ.

| Profile | Performance before / after | Accessibility before / after | SEO before / after | LCP before / after | CLS |
|---|---|---|---|---|---|
| mobile | 76 / 87 | 96 / 100 | 100 / 100 | 5.07s / 3.62s | 0 |
| desktop | 97 / 99 | 96 / 100 | 100 / 100 | 1.15s / 0.89s | 0 |

Mobile LCP remains above 2.5 seconds. Further image/animation/font tuning and field measurement remain necessary. A Lighthouse accessibility score is not a complete manual accessibility certification. Raw measurement files are retained locally under tmp/seo-*.json.

## Remaining issues and owner information

- npm audit now reports 18 findings (14 high, 4 moderate), down from 19. The React server advisory is removed. Remaining findings involve Vinext/build tooling and transitive dependencies including image-size, Vite, Wrangler, undici, sharp and drizzle-kit. Development dependencies can participate in server builds; do not assume devDependency means no production impact. A separately tested Vinext/Cloudflare toolchain upgrade is needed; no force-fix or potentially breaking framework upgrade was applied.
- Confirm business address, operating hours, legal business details, destination opening hours, current entry fees and photo publication rights. Missing details are documented here, not fabricated on public pages. No ratings, reviews, FAQ rich-result claims or LocalBusiness eligibility claims were added.
- Preserve verified owner-authored content; update the keyword map when adding destinations. No search-volume/difficulty data is claimed.

## Search Console setup and next 30 days

1. Add a URL-prefix property for https://abha-tourist-center.shoneclg.chatgpt.site/. Use an available HTML verification tag or file method; supply Google's exact value for a later deployment. A Domain property requires DNS control, which this subdomain does not establish.
2. After ownership verification, submit sitemap.xml. Inspect the homepage, collection and representative destination URLs, then request indexing for important new/updated URLs.
3. Week 1: confirm anonymous access and inspect indexing/canonical reports; validate representative pages with Google's Rich Results Test and Schema.org Validator.
4. Week 2: supply missing business/destination facts and refine thin descriptions with verified practical visitor information.
5. Week 3: repeat mobile performance tests; prioritize hero/font delivery and animation main-thread cost. Review Search Console Core Web Vitals if sufficient field data exists.
6. Week 4: review impressions, clicks, CTR and actual queries, identify content gaps, and prioritize a controlled dependency upgrade. Rankings, rich results and indexing are not guaranteed.

References: https://developers.google.com/search/docs/essentials/technical ; https://developers.google.com/search/docs/appearance/structured-data/sd-policies ; https://web.dev/articles/vitals

## Final navigation regression fix

Production browser testing uncovered broken Vinext client-side Link prefetch and navigation exports (TypeError). Internal navigation now uses ordinary crawlable anchors, preserving URLs, same-page smooth scrolling, and JavaScript-free navigation. Collection and destination clicks pass after rebuilding, with no new console errors. Mobile menu Escape dismissal restores focus to Open navigation; 390px mobile and 768px tablet destination layouts show no horizontal overflow. Full page navigation replaces speculative RSC prefetch; cinematic animations initialize on each page load.

## Production verification — 2026-10-19

Version 11 deployed successfully from source commit 6572bc90ab516262ef219de5f50283081c4fb2a4. Approved public visitor access is enabled (access revision 4); administrative writes still require the configured owner johnrajj1923@gmail.com. The anonymous production crawl passed all 32 public routes and 135 linked resources, with no failures. It verified unique metadata, canonicals, sitemap, robots, JSON-LD parsing, actual missing-route 404 responses, admin noindex and anonymous POST rejection on both editing/upload endpoints. Raw evidence: tmp/seo-check-live.json. GitHub main received the deployed source. This report's final documentation-only commit records post-publication evidence.

The existing signed-in owner browser session showed John Raj's 29-place dashboard. Saving High City without changing its fields returned 'Saved. Your changes are now live on the website.' This creates an equivalent database override; no content, photos or prices were changed. Screenshot evidence: tmp/qa/seo-owner-save.png. Google Search Console setup remains pending; no account verification token was available.
