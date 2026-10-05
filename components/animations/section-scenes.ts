type GSAP = typeof import("gsap").gsap;

export function sectionScenes(gsap: GSAP, compact: boolean) {
  const lift = compact ? 18 : 40;
  const sequence = (element: Element) =>
    gsap.timeline({
      defaults: { duration: compact ? 0.65 : 0.95, ease: "power3.out" },
      // Keep completed triggers owned by the context until cleanup. Killing them
      // during GSAP's nested refresh can race when rebuilding far down the page.
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  const heading = (element: Element) => {
    const title = element.querySelector("h1,h2");
    if (title)
      sequence(element)
        .from(title, { y: lift, clipPath: "inset(0% 0% 100% 0%)" })
        .from(
          element.querySelectorAll(
            ":scope > .eyebrow, :scope > p, :scope > .text-link",
          ),
          { y: 14, opacity: 0, stagger: 0.08 },
          0.12,
        );
  };
  document
    .querySelectorAll(
      ".planner-heading, .experiences-heading, .about-copy, .contact-intro, .destination-help",
    )
    .forEach(heading);
  document.querySelectorAll(".experience-story").forEach((story, index) => {
    sequence(story)
      .from(story.querySelector(".experience-image"), {
        clipPath: index % 2 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
        duration: compact ? 0.8 : 1.25,
      })
      .from(
        story.querySelectorAll("h3, p, .eyebrow, .experience-arrow"),
        { y: lift * 0.6, opacity: 0, stagger: 0.08 },
        0.25,
      );
  });
  const planner = document.querySelector(".planner-panel");
  if (planner) {
    sequence(planner)
      .from(planner, { y: lift, clipPath: "inset(0% 0% 14% 0%)" })
      .from(
        planner.querySelectorAll(
          ".planner-step, .interest-pills > button, .planner-send",
        ),
        { y: 18, opacity: 0, stagger: 0.045 },
        0.1,
      );
    gsap.to(".planner-compass", {
      rotation: compact ? 60 : 150,
      ease: "none",
      scrollTrigger: {
        trigger: ".planner-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }
  document.querySelectorAll(".gallery-image").forEach((photo, index) => {
    sequence(photo).from(photo, {
      clipPath: index % 2 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
      duration: compact ? 0.75 : 1.15,
    });
  });
  const form = document.querySelector(".contact-form");
  if (form)
    sequence(form).from(
      form.querySelectorAll(":scope > *"),
      { y: lift, opacity: 0, stagger: 0.09 },
      0.15,
    );
  const contact = document.querySelector(".contact-section");
  if (contact)
    gsap.from(".contact-rule", {
      scaleX: 0,
      transformOrigin: "left",
      ease: "none",
      scrollTrigger: {
        trigger: contact,
        start: "top 90%",
        end: "top 35%",
        scrub: 0.4,
      },
    });
  const footer = document.querySelector(".footer-top");
  if (footer)
    sequence(footer).from(footer.children, {
      y: lift,
      opacity: 0,
      stagger: 0.1,
    });
  const detail = document.querySelector(".detail-hero");
  if (detail)
    sequence(detail).from(detail, {
      clipPath: "inset(10% 4% 10% 4%)",
      duration: compact ? 0.8 : 1.3,
    });
  const overview = document.querySelector(".detail-overview");
  if (overview) {
    const card = overview.querySelector(".visit-card");
    if (card)
      sequence(card).from(card, { y: lift, clipPath: "inset(0% 0% 15% 0%)" });
    const highlights = overview.querySelector(".highlights");
    if (highlights)
      sequence(highlights).from(highlights.children, {
        x: compact ? 12 : 25,
        opacity: 0,
        stagger: 0.1,
      });
  }
}
