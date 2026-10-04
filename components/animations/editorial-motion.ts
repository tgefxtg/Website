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
  document.querySelectorAll(".feature-story").forEach((story, index) => {
    const sequence = gsap.timeline({
      defaults: { duration: 1.15, ease: "power3.out" },
      scrollTrigger: { trigger: story, start: "top 82%", once: true },
    });
    sequence
      .from(
        story.querySelector(".feature-image"),
        {
          clipPath: index % 2 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)",
        },
        0,
      )
      .from(
        story.querySelectorAll(".story-title-line > span"),
        {
          yPercent: 115,
          rotation: 2,
          stagger: 0.12,
        },
        0.15,
      )
      .from(
        story.querySelectorAll(
          ".feature-story-copy > .eyebrow, .feature-story-copy > p, .feature-story-footer",
        ),
        {
          opacity: 0,
          y: 24,
          stagger: 0.1,
          duration: 0.85,
        },
        0.25,
      );
  });
  const ribbon = document.querySelector(".wander-section");
  if (ribbon) {
    ribbon.querySelectorAll<HTMLElement>(".wander-row").forEach((row) => {
      const direction = Number(row.dataset.wanderDirection);
      gsap.fromTo(
        row,
        { xPercent: direction < 0 ? 0 : -22 },
        {
          xPercent: direction < 0 ? -22 : 0,
          ease: "none",
          scrollTrigger: {
            trigger: ribbon,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        },
      );
    });
    gsap.to(".wander-compass", {
      rotation: 180,
      ease: "none",
      scrollTrigger: {
        trigger: ribbon,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7,
      },
    });
    gsap.from(".wander-baseline span", {
      scaleX: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ribbon,
        start: "top 70%",
        end: "bottom 40%",
        scrub: 0.7,
      },
    });
  }
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
  // Delegate hover so cards added by a filter receive the same interaction.
  const tilts = new Map<
    HTMLElement,
    { x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo> }
  >();
  let active: HTMLElement | null = null;
  const reset = () => {
    if (active) {
      tilts.get(active)?.x(0);
      tilts.get(active)?.y(0);
    }
    active = null;
  };
  const tilt = (event: PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-tilt]",
    );
    if (target !== active) reset();
    if (!target) return;
    active = target;
    if (!tilts.has(target)) {
      gsap.set(target, { transformPerspective: 1000 });
      tilts.set(target, {
        x: gsap.quickTo(target, "rotationX", {
          duration: 0.5,
          ease: "power3.out",
        }),
        y: gsap.quickTo(target, "rotationY", {
          duration: 0.5,
          ease: "power3.out",
        }),
      });
    }
    const box = target.parentElement!.getBoundingClientRect();
    const positionX = gsap.utils.clamp(
      -1,
      1,
      ((event.clientX - box.left) / box.width) * 2 - 1,
    );
    const positionY = gsap.utils.clamp(
      -1,
      1,
      ((event.clientY - box.top) / target.offsetHeight) * 2 - 1,
    );
    tilts.get(target)!.x(-positionY * 3);
    tilts.get(target)!.y(positionX * 4);
  };
  document.addEventListener("pointermove", tilt, { passive: true });
  document.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  return () => {
    listeners.forEach((remove) => remove());
    document.removeEventListener("pointermove", tilt);
    document.removeEventListener("pointerleave", reset);
    window.removeEventListener("blur", reset);
    tilts.forEach(({ x, y }, el) => {
      x.tween.kill();
      y.tween.kill();
      gsap.set(el, { clearProps: "transform" });
    });
  };
}
