type GSAP = typeof import("gsap").gsap;

export function entranceMotion(gsap: GSAP) {
  if (document.querySelector(".magazine-hero")) {
    const cover = gsap.timeline({ defaults: { ease: "power3.out" } });
    cover
      .from(".magazine-hero-visual", {
        clipPath: "inset(15% 10% 15% 10%)",
        duration: 1.5,
      })
      .from(".hero-photo img", { scale: 1.2, duration: 1.8 }, 0)
      .from(
        ".hero-line>span",
        {
          yPercent: 115,
          rotation: 3,
          opacity: 0,
          duration: 1.15,
          stagger: 0.13,
        },
        0.16,
      )
      .from(
        ".hero-reveal, .hero-footnote, .issue-label",
        { y: 22, opacity: 0, duration: 0.85, stagger: 0.09 },
        0.55,
      )
      .from(
        ".hero-photo-top, .hero-photo-bottom",
        { y: 20, opacity: 0, duration: 0.8 },
        0.8,
      );
  }
  document
    .querySelectorAll(
      "[data-reveal], .section-heading, .stories-heading, .detail-title-row",
    )
    .forEach((el) => {
      gsap.from(el, {
        y: 35,
        opacity: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 94%", once: true },
      });
    });
  document.querySelectorAll("[data-image-reveal]").forEach((el) => {
    gsap.from(el, {
      clipPath: "inset(12% 5% 12% 5%)",
      duration: 1.4,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
  document.querySelectorAll("[data-scroll-words]").forEach((el) => {
    gsap.from(el.querySelectorAll("span"), {
      opacity: 0.2,
      stagger: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 83%",
        end: "bottom 45%",
        scrub: 0.45,
      },
    });
  });
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
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
  const footer = document.querySelector(".footer-word");
  if (footer)
    gsap.from(footer, {
      yPercent: 45,
      opacity: 0.3,
      ease: "none",
      scrollTrigger: {
        trigger: footer,
        start: "top bottom",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });
}

export function pointerMotion(gsap: GSAP) {
  const listeners: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      x((event.clientX - box.left - box.width / 2) * 0.12);
      y((event.clientY - box.top - box.height / 2) * 0.2);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("blur", leave);
    listeners.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("blur", leave);
    });
  });
  return () => {
    listeners.forEach((remove) => remove());
  };
}
