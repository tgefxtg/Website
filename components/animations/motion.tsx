"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/admin')) { document.documentElement.dataset.motion = 'reduced'; return; }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Motion runs automatically on every route, including for returning visitors
    // who previously saved an off preference using the removed control.
    document.documentElement.dataset.motion = preference.matches ? "reduced" : "full";
    let disposed = false;
    let cleanup = () => {};
    async function init() {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }, { startMotion }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
          import("./runtime"),
        ]);
      if (disposed || preference.matches) return;
      cleanup = startMotion(gsap, ScrollTrigger, Lenis);
    }
    const initialize = () => init().catch((error) => {
      cleanup();
      if (!disposed) {
        console.error("Animation setup failed; restoring static content.", error);
        document.documentElement.dataset.motion = "reduced";
      }
    });
    const updatePreference = () => {
      cleanup();
      cleanup = () => {};
      document.documentElement.dataset.motion = preference.matches ? "reduced" : "full";
      if (!preference.matches) initialize();
    };
    if (!preference.matches) initialize();
    preference.addEventListener("change", updatePreference);
    return () => {
      disposed = true;
      preference.removeEventListener("change", updatePreference);
      cleanup();
    };
  }, [pathname]);
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <span className="photo-cursor" aria-hidden="true">
        <ArrowUpRight size={22} />
      </span>
    </>
  );
}
