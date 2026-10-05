"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { startMotion } from "./runtime";

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    // Motion runs automatically on every route, including for returning visitors
    // who previously saved an off preference using the removed control.
    document.documentElement.dataset.motion = "full";
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
        document.documentElement.dataset.motion = "reduced";
      }
    });
    return () => {
      disposed = true;
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
