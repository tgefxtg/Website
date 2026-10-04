"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { entranceMotion, pointerMotion } from "./editorial-motion";
import { desktopScenes } from "./scroll-scenes";

type MotionMode = "full" | "reduced";
const preferenceKey = "abha-motion";

export function Motion() {
  const pathname = usePathname();
  const [mode, setMode] = useState<MotionMode | null>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(preferenceKey);
      } catch {
        /* Storage is optional. */
      }
      setMode(
        saved === "full" || saved === "reduced"
          ? saved
          : preference.matches
            ? "reduced"
            : "full",
      );
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mode) return;
    document.documentElement.dataset.motion = mode;
    if (mode !== "full") return;
    let disposed = false;
    let cleanup = () => {};
    async function init() {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: true },
        });
        entranceMotion(gsap);
      });
      const mm = gsap.matchMedia();
      cleanup = () => {
        mm.revert();
        ctx.revert();
      };
      mm.add(
        "(min-width: 1001px) and (min-height: 650px) and (pointer: fine)",
        () => {
          document.documentElement.dataset.scrollScenes = "pinned";
          const lenis = new Lenis({
            duration: 1.05,
            smoothWheel: true,
            anchors: { offset: -90 },
            prevent: (node) => node.closest("dialog") !== null,
          });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          const clearScenes = desktopScenes(gsap, ScrollTrigger, lenis);
          return () => {
            clearScenes();
            gsap.ticker.remove(tick);
            lenis.destroy();
            delete document.documentElement.dataset.scrollScenes;
          };
        },
      );
      mm.add("(hover: hover) and (pointer: fine)", () => pointerMotion(gsap));
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh();
      };
      document.fonts.ready.then(refresh);
      const timer = window.setTimeout(refresh, 500);
      cleanup = () => {
        clearTimeout(timer);
        mm.revert();
        ctx.revert();
        document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          el.textContent = el.dataset.count || "";
        });
      };
    }
    init().catch(() => {
      cleanup();
      if (!disposed) setMode("reduced");
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [pathname, mode]);

  const toggle = () => {
    const next = mode === "full" ? "reduced" : "full";
    try {
      localStorage.setItem(preferenceKey, next);
    } catch {
      /* Keep the choice for this visit. */
    }
    setMode(next);
  };
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <button
        className="motion-toggle"
        onClick={toggle}
        disabled={!mode}
        aria-pressed={mode === "full"}
        aria-label={mode === "full" ? "Reduce animations" : "Enable animations"}
        title={mode === "full" ? "Reduce animations" : "Enable animations"}
      >
        {mode === "full" ? <Pause size={14} /> : <Play size={14} />}
        <span>Motion {mode === "full" ? "on" : "off"}</span>
      </button>
    </>
  );
}
