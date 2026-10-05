# Animation setup and section guide

The site uses Next.js 16.3.8 App Router, React 19.3.0, TypeScript and npm. Installed motion dependencies are GSAP 3.15.0 and Lenis 1.3.26. ScrollTrigger is included with GSAP.

## Runtime

`components/animations/runtime.ts` registers ScrollTrigger with `gsap.registerPlugin(ScrollTrigger)`. Desktop Lenis uses `autoRaf: false`; one GSAP ticker calls `lenis.raf(seconds * 1000)`, Lenis scroll events call `ScrollTrigger.update`, and lag smoothing is disabled. The official Lenis stylesheet is imported. ScrollTrigger refresh also resizes Lenis. Fonts, loaded images, changing filters and planner dimensions trigger refreshed measurements.

Lenis reads the CSS header scroll padding for anchor navigation. Initial deep links are corrected after pin spacing is measured. Opening a native dialog stops Lenis; closing it resumes scrolling. Dialog content remains independently scrollable.

The React effect cleans up before route changes and unmount. GSAP matchMedia reverts owned animations and pins at breakpoint changes. Cleanup also removes the ticker, scroll subscriptions, dialog observer, collection observers, pointer handlers, focus handlers, timers and Lenis instance. Async imports are guarded against unmount. A setup failure restores static content and logs its cause.

## Section concepts

| Section | Desktop concept | Compact screens |
| --- | --- | --- |
| Navigation | Shrinking sticky header, active underline, magnetic primary action and page progress | Curtain menu with staggered links; native focus trapping |
| Hero | Expanding photo frame, staggered masked serif lines, slow photo/copy parallax and drifting mist | Framed photo and headline sequence without a pin |
| Introduction | Word-by-word scroll illumination, rising headline and destination counter | Same reading sequence with shorter lifts |
| Mountain panorama | Pinned cinematic frame expands; landscape zooms, mist clears, title halves converge and progress draws | Unpinned scrubbed zoom, smaller frame reveal, title lift and mist movement |
| Editorial ribbon | Opposing oversized text tracks, turning compass and drawing baseline | Shorter opposing travel |
| Featured stories | Alternating horizontal photo curtains, masked title lines, sequenced copy and internal photo parallax | Same editorial reveals with gentler image zoom |
| Horizontal journey | Pinned five-card photo rail, internal image parallax, chapter count and progress line | Native horizontal scroll with snap, live progress and chapter count |
| Destination collection | Staggered lift and scale as cards arrive, restrained pointer tilt and photo cursor | Shorter staggered lift and scale; touch-friendly cards |
| Experiences | Sticky editorial heading, active chapter markers, alternating vertical image curtains and sequenced copy | Flowing essays with shorter text lifts and subtle photo zoom |
| Trip planner | Masked heading, unfolding panel, staggered interest choices, turning compass, animated result cards and selection feedback | Shorter panel and result arrivals; reduced compass travel |
| Gallery | Alternating vertical curtains, asymmetric photo parallax, contextual cursor and lightbox transitions | Curtain reveals and accessible native lightbox without parallax |
| About | Masked headline, sequenced copy and photo parallax | Shorter headline lift and gentle photo zoom |
| Contact | Scroll-drawn accent rule, masked heading, staggered fields and focus feedback | Shorter field entrances and same usable form |
| Footer | Staggered columns and oversized wordmark rising with scroll | Shorter column entrances and wordmark reveal |
| Destination index | Editorial heading and dynamically refreshed card choreography | Shorter card arrivals; native scrolling |
| All 30 detail pages | Framed hero reveal, photo parallax, staggered highlights, visit-card reveal, gallery curtains and related-card arrivals | Gentle hero zoom and shorter content sequences |

## Accessibility and performance

- Motion starts automatically on every visit and route. The site owner requested always-on motion; the former toggle, stored preference and OS preference switching have been removed.
- If animation setup fails, a static fallback restores content and navigation. Normal desktop and mobile visits always run their animation sequences.
- Compact mode is used below 1001px width, below 650px height, or without a fine pointer. It retains intentional animation while using native scrolling and no long pins.
- The native cursor remains visible. The decorative photo cursor is pointer-inert and only appears on fine-pointer devices.
- Keyboard focus reveals collection cards immediately and brings pinned journey cards into view. Dialogs keep native focus trapping, Escape handling and focus restoration.
- Existing text, all 30 destinations, local photography, metadata, buttons, map links and WhatsApp draft flows remain intact.

## Maintenance

Keep new animation work within the existing runtime and GSAP contexts; do not add another RAF loop or use global `ScrollTrigger.killAll()`. Prefer animating a photo's wrapper for reveals and its inner image for parallax to avoid transform conflicts. Reuse collection observers for React-updated cards.

Integration follows the [Lenis GSAP guidance](https://github.com/darkroomengineering/lenis) and [GSAP matchMedia lifecycle](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
