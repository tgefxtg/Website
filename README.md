# Abha Tourist Center

A responsive travel website with an ivory editorial design, serif typography, 29 destination pages, local photography, GSAP scroll scenes, a searchable destination collection, a trip wish list and WhatsApp enquiries.

## Run locally

Use Node.js 22.13 or newer (Node 24 recommended). The React/App Router site runs on Vinext and Cloudflare Workers so owner changes can be stored without rebuilding.

```sh
npm install
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_uneven_hex.sql
npm run dev
```

The local address is normally `http://127.0.0.1:5173`. Apply each local database migration only once. For local owner testing, add `ADMIN_OWNER_EMAIL="seedy@sites.test"` to an untracked `.dev.vars` file. The portable development sign-in is simulated; it is never included in the production bundle.

```sh
npm run typecheck
npm test
npm run build
```

`npm run build` generates the Worker and assets in `dist/`. Publish through Sites using the existing project ID; Sites provisions D1 (`DB`), R2 (`BUCKET`) and applies the committed migrations. `npm start` previews the built Worker locally. The old static `out/` export and `scripts/check-export.mjs` are no longer deployment inputs.

## Owner dashboard

Open `/admin/` or use **Owner login** in the footer. Sign in with the website owner's ChatGPT account. Add or edit a place's name, category, location, introduction, description, main photo and optional package price in SAR. Changes are saved immediately to D1, with uploaded photos in R2. New places receive a destination page and are included in search, trip planning and the sitemap. Package prices are separate from reference entry-ticket fees.

`ADMIN_OWNER_EMAIL` is configured as a hosted runtime secret. The first matching platform-authenticated login binds the owner's stable Site user ID in the `owners` table; subsequent access checks use that ID. Each write checks owner authorization and request origin. Price and content limits are validated server-side, uploads are size/type checked, and revision checks prevent silent concurrent overwrites.

The 29 bundled records remain fallback content; database records override them. Database content and uploaded images survive deployments and are not stored in GitHub. Local test data is separate from production. Back up D1 and R2 before changing or migrating hosting.

## Content and configuration

- `data/destinations.json` contains the destination records, source-page references, supplied Arabic names, reference prices and original map links.
- `data/destinations.ts` defines the interface and filter categories.
- `lib/whatsapp.ts` owns the phone number and safely encoded messages.
- `styles/editorial.css` owns the magazine design and responsive layouts.
- `components/animations/motion.tsx` starts motion automatically and owns route lifecycle cleanup. `runtime.ts` registers ScrollTrigger and connects desktop Lenis to GSAP's shared clock. `scroll-scenes.ts` owns desktop pins and parallax; `compact-scenes.ts` provides shorter scroll scenes and a native horizontal journey on small, short and touch viewports. `section-scenes.ts` choreographs the planner, stories, gallery, contact, footer and detail pages. See [the section-by-section animation guide](docs/animation-audit.md). Motion is always enabled automatically; there is no on/off control or stored visitor preference. `styles/motion.css` contains scene layouts and static fallbacks for setup failures.
- `lib/i18n.ts` defines language direction. English is active. Verified Arabic labels are preserved and an Arabic-compatible font is bundled. Full Arabic interface translations and localized routes can be added here; no unverified translation is presented as complete.
- The moving editorial ribbon, masked story headlines, alternating image reveals, and gallery photo transitions start automatically. Destination cards reveal in staggered groups as they enter the viewport; filtering and expansion refresh scroll measurements. Pointer depth is limited to fine-pointer devices. Keyboard focus immediately reveals a card, and route cleanup removes pinning, transforms, observers, and animation listeners.
- `lib/site.ts` uses `NEXT_PUBLIC_SITE_URL` for canonical, sitemap and structured-data URLs. Set it before building for a different domain.
- `components/ui/testimonials.tsx` renders only supplied reviews explicitly cleared for publication. No reviews are included.
- The optional `configure_trip_wishlist` WebMCP tool stages the same interests/destinations as the visible planner and never sends messages.

## Photography and source notes

The original collection used 101 destination photos extracted from the supplied “Aseer Explore – Nasik Ahammed” PDF. The main photos for 22 destinations have since been replaced with images supplied and selected by the owner, stored as `*-selected.webp` with six responsive variants. These are used in destination cards, featured stories, detail-page heroes and the first gallery position; additional reference gallery photos remain. The source PDF is not published. Smaller source images are not artificially enlarged. Local responsive WebP variants use the Next/Image custom loader so the static site does not need a remote image optimizer.

The Al Soudah cover photo is “Al Sowda Hill top 04” by Irshadpp, Wikimedia Commons, CC BY-SA 4.0. Attribution and license links appear on `/credits/`. The adapted cover photo keeps its original share-alike license.

The Summer Gathering has a malformed source map link and its map action is hidden. Conflicting historical mosque dates are omitted. Four reference price records are clearly labelled for reconfirmation. Supplied photography permissions should be confirmed by the business before a public commercial launch; the initial Sites deployment is private.

## Enquiries and privacy

No backend, analytics, account or database is required. Forms and the planner generate WhatsApp drafts using +966 53 649 3716. Visitors review and send in WhatsApp. No enquiry is retained on this website. Navigation and form controls work without GSAP. Dialogs support Escape, native focus trapping and focus restoration.
