# Abha Tourist Center

A responsive travel website with an ivory editorial design, serif typography, 30 destination pages, local photography, GSAP scroll scenes, a searchable destination collection, a trip wish list and WhatsApp enquiries.

## Run locally

Use Node.js 20.9 or newer (Node 24 recommended).

```sh
npm install
npm run dev
```

If port 3000 is already in use, run `npm run dev -- --port 3001` and use the URL printed in the terminal.

```sh
npm run typecheck
npm test
npm run build
```

`npm run build` generates a static site in `out/`. Deploy that folder to a static host. All 30 detail routes are generated at build time. `next start` is not used for static exports. `npm run preview` serves the production export locally with Node.

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

101 destination photos were extracted from the supplied “Aseer Explore – Nasik Ahammed” PDF. The source PDF is not published. Photos are attached to their source destinations; the map-icon images and cover contact information were excluded. Smaller source images are not artificially enlarged. Local responsive WebP variants use the Next/Image custom loader so the static site does not need a remote image optimizer.

The Al Soudah cover photo is “Al Sowda Hill top 04” by Irshadpp, Wikimedia Commons, CC BY-SA 4.0. Attribution and license links appear on `/credits/`. The adapted cover photo keeps its original share-alike license.

Silent Valley Hills has no supplied photograph and has an explicit placeholder. The Summer Gathering has a malformed source map link and its map action is hidden. Conflicting historical mosque dates are omitted. Four reference price records are clearly labelled for reconfirmation. Supplied photography permissions should be confirmed by the business before a public commercial launch; the initial Sites deployment is private.

## Enquiries and privacy

No backend, analytics, account or database is required. Forms and the planner generate WhatsApp drafts using +966 53 649 3716. Visitors review and send in WhatsApp. No enquiry is retained on this website. Navigation and form controls work without GSAP. Dialogs support Escape, native focus trapping and focus restoration.
