"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { WhatsAppLink } from "../ui/whatsapp-link";
const links = [
  ["Home", "/#main"],
  ["Destinations", "/destinations/"],
  ["Experiences", "/#experiences"],
  ["About", "/#about"],
  ["Gallery", "/#gallery"],
  ["Contact", "/#contact"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (path !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    const targets = document.querySelectorAll(
      "#intro,#destinations,#experiences,#about,#gallery,#contact,#plan",
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const el = dialog.current;
    if (open) {
      el?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      el?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    toggle.current?.focus();
  };
  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, url]) => (
            <a
              key={name}
              className={
                (path.startsWith("/destinations") && name === "Destinations") ||
                (path === "/" &&
                  (url === `/#${activeSection}` ||
                    (name === "Destinations" &&
                      activeSection === "destinations") ||
                    (name === "Home" &&
                      (!activeSection || activeSection === "intro"))))
                  ? "active"
                  : ""
              }
              href={url}
            >
              {name}
            </a>
          ))}
          <a href="/admin/" className={path.startsWith("/admin") ? "active" : ""}>
            Admin panel
          </a>
        </nav>
        <WhatsAppLink className="header-chat" label="Chat on WhatsApp">
          Let’s talk
        </WhatsAppLink>
        <a
          href="/#plan"
          className="button button-green nav-plan"
          data-magnetic
        >
          Plan your trip <ArrowUpRight size={17} />
        </a>
        <button
          ref={toggle}
          className="menu-toggle icon-button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu />
        </button>
      </header>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-menu"
        onCancel={() => setOpen(false)}
        aria-label="Navigation"
      >
        <div className="mobile-menu-top">
          <Brand />
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map(([name, url], i) => (
            <a key={name} href={url} onClick={close}>
              <span>0{i + 1}</span>
              {name}
              <ArrowUpRight />
            </a>
          ))}
        </nav>
        <a href="/admin/" className="button button-green" onClick={close}>
          Admin panel <ArrowUpRight size={18} />
        </a>
        <WhatsAppLink />{" "}
        <p className="eyebrow">A little closer to the extraordinary.</p>
      </dialog>
    </>
  );
}
