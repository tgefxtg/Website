type GSAP = typeof import("gsap").gsap;
type Triggers = typeof import("gsap/ScrollTrigger").ScrollTrigger;

// React can replace the collection after filtering, without a route change.
export function collectionMotion(gsap: GSAP, ScrollTrigger: Triggers) {
  const context = gsap.context(() => {});
  const observed = new Set<Element>();
  const revealed = new WeakSet<Element>();
  let refreshTimer: number | undefined;
  const refresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target);
      if (!arriving.length) return;
      arriving.forEach((el) => {
        revealed.add(el);
        observer.unobserve(el);
      });
      context.add(() => {
        gsap.fromTo(
          arriving,
          { y: 48, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.085,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        );
      });
    },
    { rootMargin: "0px 0px -30px 0px", threshold: 0.05 },
  );
  const collect = () => {
    observed.forEach((el) => {
      if (!el.isConnected) {
        observer.unobserve(el);
        observed.delete(el);
      }
    });
    document.querySelectorAll(".destination-card").forEach((el) => {
      if (!observed.has(el) && !revealed.has(el)) {
        observed.add(el);
        observer.observe(el);
      }
    });
  };
  const changes = new MutationObserver(() => {
    collect();
    refresh();
  });
  const sizes = new ResizeObserver(refresh);
  document.querySelectorAll(".explorer, .planner-panel").forEach((el) => {
    changes.observe(el, { childList: true, subtree: true });
    sizes.observe(el);
  });
  const focus = (event: FocusEvent) => {
    const card = (event.target as HTMLElement).closest(".destination-card");
    if (!card) return;
    observer.unobserve(card);
    revealed.add(card);
    gsap.killTweensOf(card);
    gsap.set(card, { clearProps: "transform,opacity" });
  };
  document.addEventListener("focusin", focus);
  collect();
  return () => {
    window.clearTimeout(refreshTimer);
    observer.disconnect();
    changes.disconnect();
    sizes.disconnect();
    document.removeEventListener("focusin", focus);
    context.revert();
  };
}
