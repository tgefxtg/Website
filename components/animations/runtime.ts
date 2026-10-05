import type Lenis from "lenis";
import { entranceMotion, pointerMotion } from "./editorial-motion";
import { desktopScenes } from "./scroll-scenes";
import { compactScenes } from "./compact-scenes";
import { sectionScenes } from "./section-scenes";
import { collectionMotion } from "./collection-motion";

type GSAP = typeof import("gsap").gsap;
type Triggers = typeof import("gsap/ScrollTrigger").ScrollTrigger;

export function startMotion(
  gsap: GSAP,
  ScrollTrigger: Triggers,
  SmoothScroll: typeof Lenis,
) {
  gsap.registerPlugin(ScrollTrigger);
  // Lenis and ScrollTrigger share this clock; do not start a second RAF loop.
  gsap.ticker.lagSmoothing(0);
  const media = gsap.matchMedia();
  let disposed = false;
  let timer: number | undefined;
  let firstRefresh = true;
  const refresh = () => {
    if (disposed) return;
    ScrollTrigger.refresh();
    if (firstRefresh) {
      firstRefresh = false;
      // Deep links must be positioned after the desktop pin spacing exists.
      try {
        const target = document.getElementById(
          decodeURIComponent(location.hash.slice(1)),
        );
        if (target)
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 95,
            behavior: "instant",
          });
      } catch {
        /* A malformed hash must not prevent the page from rendering. */
      }
    }
  };
  const scheduleRefresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, 160);
  };
  const stop = () => {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(timer);
    document.removeEventListener("load", scheduleRefresh, true);
    media.revert();
  };
  try {
    media.add(
      {
        desktop:
          "(min-width: 1001px) and (min-height: 650px) and (pointer: fine)",
        all: "all",
      },
      (context) => {
        const desktop = Boolean(context.conditions?.desktop);
        const cleanups: (() => void)[] = [];
        document.documentElement.dataset.scrollScenes = desktop
          ? "pinned"
          : "flow";
        // Capture cleanup before building scenes, including partially failed setup.
        const clear = () => {
          cleanups.reverse().forEach((cleanup) => cleanup());
          delete document.documentElement.dataset.scrollScenes;
          document
            .querySelectorAll<HTMLElement>("[data-count]")
            .forEach((el) => {
              el.textContent = el.dataset.count || "";
            });
        };
        try {
          if (desktop) {
            const lenis = new SmoothScroll({
              autoRaf: false,
              lerp: 0.085,
              smoothWheel: true,
              syncTouch: false,
              // The site runs motion automatically, without a preference toggle.
              respectReducedMotion: false,
              stopInertiaOnNavigate: true,
              // Lenis reads the shared CSS scroll-padding-top itself.
              anchors: true,
              prevent: (node) =>
                node.closest("dialog, [data-lenis-prevent]") !== null,
            });
            cleanups.push(() => lenis.destroy());
            const unsubscribe = lenis.on("scroll", ScrollTrigger.update);
            const tick = (seconds: number) => lenis.raf(seconds * 1000);
            gsap.ticker.add(tick);
            cleanups.push(() => {
              gsap.ticker.remove(tick);
              unsubscribe();
            });
            const resize = () => lenis.resize();
            ScrollTrigger.addEventListener("refresh", resize);
            cleanups.push(() =>
              ScrollTrigger.removeEventListener("refresh", resize),
            );
            const syncDialogs = () =>
              document.querySelector("dialog[open]")
                ? lenis.stop()
                : lenis.start();
            const dialogs = new MutationObserver(syncDialogs);
            document
              .querySelectorAll("dialog")
              .forEach((dialog) =>
                dialogs.observe(dialog, {
                  attributes: true,
                  attributeFilter: ["open"],
                }),
              );
            syncDialogs();
            cleanups.push(() => dialogs.disconnect());
            cleanups.push(desktopScenes(gsap, ScrollTrigger, lenis));
          } else {
            cleanups.push(compactScenes(gsap));
          }
          gsap.to(".scroll-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: true },
          });
          entranceMotion(gsap, !desktop);
          sectionScenes(gsap, !desktop);
          cleanups.push(collectionMotion(gsap, ScrollTrigger, !desktop));
          scheduleRefresh();
          return clear;
        } catch (error) {
          clear();
          throw error;
        }
      },
    );
    media.add("(hover: hover) and (pointer: fine)", () => pointerMotion(gsap));
    document.addEventListener("load", scheduleRefresh, true);
    document.fonts.ready.then(() => {
      if (!disposed) scheduleRefresh();
    });
  } catch (error) {
    stop();
    throw error;
  }
  return stop;
}
