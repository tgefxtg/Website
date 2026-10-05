type GSAP = typeof import("gsap").gsap;

// Touch and short viewports keep real scroll choreography without long pins.
export function compactScenes(gsap: GSAP) {
  const mountain = document.querySelector(".mountain-scene");
  if (mountain) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: mountain,
          start: "top 90%",
          end: "bottom 20%",
          scrub: 0.35,
        },
      })
      .fromTo(
        ".mountain-landscape",
        { scale: 1.12 },
        { scale: 1, ease: "none" },
        0,
      )
      .fromTo(".mountain-title", { y: 24 }, { y: -14, ease: "none" }, 0)
      .fromTo(
        ".mountain-window",
        { clipPath: "inset(5% 4% 5% 4%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        0,
      )
      .to(".mist-left", { xPercent: -22, opacity: 0.15, ease: "none" }, 0)
      .to(".mist-right", { xPercent: 22, opacity: 0.15, ease: "none" }, 0);
  }
  document
    .querySelectorAll(
      ".feature-image, .experience-image, .about-image, .detail-hero",
    )
    .forEach((el) => {
      const photo = el.querySelector("img");
      if (photo)
        gsap.fromTo(
          photo,
          { scale: 1.075 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "bottom 25%",
              scrub: 0.3,
            },
          },
        );
    });
  const viewport = document.querySelector<HTMLElement>(".journey-viewport");
  if (!viewport) return () => {};
  const bar = document.querySelector<HTMLElement>(".journey-progress span");
  const current = document.querySelector(".journey-current");
  const cards = Array.from(
    viewport.querySelectorAll<HTMLElement>(".journey-card"),
  );
  const update = () => {
    const maximum = viewport.scrollWidth - viewport.clientWidth;
    const progress = maximum > 0 ? viewport.scrollLeft / maximum : 0;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (current)
      current.textContent = String(
        Math.min(cards.length, Math.floor(progress * cards.length) + 1),
      ).padStart(2, "0");
  };
  const previousBar = bar?.style.transform ?? "";
  const previousCount = current?.textContent ?? "01";
  viewport.addEventListener("scroll", update, { passive: true });
  const resize = new ResizeObserver(update);
  resize.observe(viewport);
  update();
  return () => {
    viewport.removeEventListener("scroll", update);
    resize.disconnect();
    if (bar) bar.style.transform = previousBar;
    if (current) current.textContent = previousCount;
  };
}
