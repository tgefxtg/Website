import type Lenis from "lenis";
type GSAP = typeof import("gsap").gsap;
type Triggers = typeof import("gsap/ScrollTrigger").ScrollTrigger;

export function desktopScenes(
  gsap: GSAP,
  ScrollTrigger: Triggers,
  lenis: Lenis,
) {
  const cleanup: (() => void)[] = [];
  const hero = document.querySelector(".magazine-hero");
  if (hero) {
    const cover = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.65,
      },
    });
    cover
      .to(".hero-photo", { yPercent: 16, scale: 1.13, ease: "none" }, 0)
      .to(".hero-content", { y: -65, ease: "none" }, 0)
      .to(".hero-fog", { xPercent: 30, opacity: 0, ease: "none" }, 0)
      .to(".hero-photo-bottom", { y: -45, ease: "none" }, 0);
  }
  const mountain = document.querySelector(".mountain-scene");
  if (mountain) {
    const scene = gsap.timeline({
      scrollTrigger: {
        trigger: mountain,
        start: "top 76px",
        end: () => `+=${window.innerHeight * 1.35}`,
        pin: ".mountain-stage",
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });
    scene
      .fromTo(
        ".mountain-window",
        { clipPath: "inset(12% 19% 12% 19%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power1.inOut" },
        0,
      )
      .fromTo(
        ".mountain-landscape",
        { scale: 1.35, yPercent: -5 },
        { scale: 1, yPercent: 3, duration: 2, ease: "none" },
        0,
      )
      .fromTo(
        ".mountain-title span",
        { xPercent: -12 },
        { xPercent: 0, duration: 1.5, ease: "none" },
        0,
      )
      .fromTo(
        ".mountain-title em",
        { xPercent: 12 },
        { xPercent: 0, duration: 1.5, ease: "none" },
        0,
      )
      .fromTo(
        ".mountain-title",
        { scale: 0.82 },
        { scale: 1.04, duration: 2, ease: "none" },
        0,
      )
      .to(
        ".mist-left",
        { xPercent: -70, opacity: 0, duration: 1.6, ease: "none" },
        0,
      )
      .to(
        ".mist-right",
        { xPercent: 70, opacity: 0, duration: 1.6, ease: "none" },
        0,
      )
      .from(
        ".mountain-footer, .mountain-overline",
        { opacity: 0, y: 18, duration: 0.6 },
        0.7,
      )
      .fromTo(
        ".mountain-meter span",
        { scaleX: 0 },
        { scaleX: 1, duration: 2, ease: "none" },
        0,
      );
  }
  document
    .querySelectorAll(
      ".feature-image, .experience-image, .about-image, .detail-hero",
    )
    .forEach((el) => {
      const img = el.querySelector("img");
      if (img)
        gsap.fromTo(
          img,
          { scale: 1.18, yPercent: -5 },
          {
            scale: 1.12,
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
    });
  document
    .querySelectorAll(".gallery-grid.editorial .gallery-image")
    .forEach((el, index) => {
      gsap.fromTo(
        el,
        { y: index % 3 === 1 ? 55 : 0 },
        {
          y: index % 3 === 1 ? -25 : -12,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    });
  document.querySelectorAll(".experience-story").forEach((el, index) => {
    const activate = () =>
      document
        .querySelectorAll(".experience-chapter")
        .forEach((chapter, i) =>
          chapter.classList.toggle("is-current", i === index),
        );
    ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: activate,
      onEnterBack: activate,
    });
  });
  const section = document.querySelector<HTMLElement>(".journey-section");
  const track = document.querySelector<HTMLElement>(".journey-track");
  if (section && track) {
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>(".journey-card"),
    );
    const current = section.querySelector(".journey-current");
    const distance = () =>
      Math.max(
        0,
        track.scrollWidth - window.innerWidth + window.innerWidth * 0.06,
      );
    const journey = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 76px",
        end: () => `+=${distance()}`,
        pin: ".journey-pin",
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(".journey-progress span", { scaleX: self.progress });
          if (current)
            current.textContent = String(
              Math.min(
                cards.length,
                Math.floor(self.progress * cards.length) + 1,
              ),
            ).padStart(2, "0");
        },
      },
    });
    cards.forEach((card) => {
      gsap.fromTo(
        card.querySelector("img"),
        { scale: 1.14, xPercent: -4 },
        {
          xPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            containerAnimation: journey,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        },
      );
    });
    const focusJourney = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!target.matches(":focus-visible")) return;
      const card = target.closest<HTMLElement>(".journey-card");
      const trigger = journey.scrollTrigger;
      if (!card || !trigger) return;
      const offset = Math.min(
        distance(),
        Math.max(0, card.offsetLeft - cards[0].offsetLeft),
      );
      lenis.scrollTo(trigger.start + offset, { immediate: true });
      journey.progress(distance() ? offset / distance() : 0);
    };
    track.addEventListener("focusin", focusJourney);
    cleanup.push(() => {
      track.removeEventListener("focusin", focusJourney);
      if (current) current.textContent = "01";
    });
  }
  return () => cleanup.forEach((remove) => remove());
}
