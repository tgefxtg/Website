"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
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
      const mm = gsap.matchMedia();
      const ctx = gsap.context(() => {
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: true },
        });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const local = gsap.context(() => {
          if (document.querySelector(".magazine-hero")) {
            gsap.from(".hero-line>span", {
              yPercent: 112,
              duration: 1.1,
              stagger: 0.12,
              ease: "power3.out",
              delay: 0.05,
            });
            gsap.from(".hero-reveal", {
              y: 18,
              opacity: 0,
              duration: 0.8,
              stagger: 0.12,
              delay: 0.55,
            });
            gsap.from(".magazine-hero-visual", {
              clipPath: "inset(10% 0 10% 0)",
              opacity: 0.4,
              duration: 1.3,
              ease: "power3.out",
            });
          }
          document.querySelectorAll("[data-reveal]").forEach((el) =>
            gsap.from(el, {
              y: 28,
              opacity: 0,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            }),
          );
          document.querySelectorAll("[data-image-reveal]").forEach((el) =>
            gsap.from(el, {
              clipPath: "inset(7% 0 7% 0)",
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            }),
          );
          document
            .querySelectorAll<HTMLElement>("[data-count]")
            .forEach((el) => {
              const value = { n: 0 };
              gsap.to(value, {
                n: Number(el.dataset.count),
                duration: 1.5,
                snap: { n: 1 },
                onUpdate: () => {
                  el.textContent = String(value.n);
                },
                scrollTrigger: { trigger: el, start: "top 95%", once: true },
              });
            });
        });
        return () => local.revert();
      });
      mm.add(
        "(min-width: 1001px) and (prefers-reduced-motion: no-preference)",
        () => {
          const lenis = new Lenis({
            duration: 0.95,
            smoothWheel: true,
            anchors: { offset: -90 },
            prevent: (node) => node.closest("dialog") !== null,
          });
          lenis.on("scroll", ScrollTrigger.update);
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          let removeJourneyFocus = () => {};
          const local = gsap.context(() => {
            const hero = document.querySelector(".magazine-hero");
            if (hero) {
              gsap.to(".hero-photo", {
                yPercent: 12,
                scale: 1.08,
                ease: "none",
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
              });
              gsap.to(".hero-fog", {
                xPercent: 18,
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
              });
            }
            document.querySelectorAll(".feature-image").forEach((el) => {
              const img = el.querySelector("img");
              if (img)
                gsap.fromTo(
                  img,
                  { scale: 1.1, yPercent: -3 },
                  {
                    scale: 1,
                    yPercent: 3,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
            });
            const section =
                document.querySelector<HTMLElement>(".journey-section"),
              track = document.querySelector<HTMLElement>(".journey-track");
            if (section && track) {
              const distance = () =>
                Math.max(
                  0,
                  track.scrollWidth -
                    window.innerWidth +
                    window.innerWidth * 0.12,
                );
              const journeyTween = gsap.to(track, {
                x: () => -distance(),
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 76px",
                  end: () => `+=${distance()}`,
                  pin: ".journey-pin",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                  onUpdate: (self) =>
                    gsap.set(".journey-progress span", {
                      scaleX: self.progress,
                    }),
                },
              });
              const focusJourney = (event: FocusEvent) => {
                const target = event.target as HTMLElement;
                if (!target.matches(":focus-visible")) return;
                const card = target.closest<HTMLElement>(".journey-card");
                const trigger = journeyTween.scrollTrigger;
                if (!card || !trigger) return;
                const offset = Math.min(
                  distance(),
                  Math.max(0, card.offsetLeft - window.innerWidth * 0.06),
                );
                lenis.scrollTo(trigger.start + offset, { immediate: true });
                gsap.set(track, { x: -offset });
              };
              track.addEventListener("focusin", focusJourney);
              removeJourneyFocus = () =>
                track.removeEventListener("focusin", focusJourney);
            }
          });
          const handlers = Array.from(
            document.querySelectorAll<HTMLElement>("[data-magnetic]"),
          ).map((el) => {
            const move = (e: PointerEvent) => {
              const box = el.getBoundingClientRect();
              gsap.to(el, {
                x: (e.clientX - box.left - box.width / 2) * 0.08,
                y: (e.clientY - box.top - box.height / 2) * 0.12,
                duration: 0.35,
              });
            };
            const leave = () => {
              gsap.to(el, { x: 0, y: 0, duration: 0.4 });
            };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerleave", leave);
            return () => {
              el.removeEventListener("pointermove", move);
              el.removeEventListener("pointerleave", leave);
              gsap.set(el, { clearProps: "transform" });
            };
          });
          return () => {
            removeJourneyFocus();
            handlers.forEach((fn) => fn());
            local.revert();
            gsap.ticker.remove(tick);
            lenis.destroy();
          };
        },
      );
      const refresh = () => {
        if (!disposed) ScrollTrigger.refresh();
      };
      document.fonts.ready.then(refresh);
      const timer = setTimeout(refresh, 500);
      cleanup = () => {
        clearTimeout(timer);
        mm.revert();
        ctx.revert();
      };
    }
    init();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [pathname]);
  return <div className="scroll-progress" aria-hidden="true" />;
}
