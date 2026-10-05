"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { startMotion } from "./runtime";

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
      cleanup = startMotion(gsap, ScrollTrigger, Lenis);
    }
    init().catch((error) => {
      cleanup();
      if (!disposed) {
        console.error("Animation setup failed; restoring static content.", error);
        setMode("reduced");
      }
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
      <span className="photo-cursor" aria-hidden="true">
        <ArrowUpRight size={22} />
      </span>
      <button
        className="motion-toggle"
        onClick={toggle}
        disabled={!mode}
        aria-pressed={mode === "full"}
        aria-label={mode === "full" ? "Reduce animations" : "Enable animations"}
        title={mode === "full" ? "Reduce animations" : "Enable animations"}
      >
        {mode === "full" ? <Pause size={14} /> : <Play size={14} />}
        <span>{mode === "full" ? "Motion on" : "Enable motion"}</span>
      </button>
    </>
  );
}
