"use client";
import { FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { whatsappUrl, DISPLAY_PHONE } from "@/lib/whatsapp";
import { WhatsAppLink } from "../ui/whatsapp-link";
import { WhatsAppIcon } from "../ui/icons";
export function Contact({destinations}:{destinations:Destination[]}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Hello Abha Tourist Center 👋\nName: ${String(data.get("name")).trim()}\nPhone: ${String(data.get("phone")).trim() || "Not provided"}\nDestination: ${data.get("destination") || "I would love your recommendations"}\nMessage: ${String(data.get("message")).trim()}`;
    window.location.assign(whatsappUrl(message));
  }
  return (
    <section id="contact" className="contact-section">
      <div className="contact-rule" aria-hidden="true" />
      <div className="contact-intro" data-reveal>
        <span className="eyebrow">THE BEST JOURNEYS BEGIN WITH HELLO</span>
        <h2>
          Your Abha
          <br />
          adventure
          <br />
          <em>starts here.</em>
        </h2>
        <p>
          Tell us what you have in mind.
          <br />
          Let’s make a little room for extraordinary.
        </p>
        <WhatsAppLink className="contact-phone">
          {DISPLAY_PHONE}
          <ArrowUpRight size={20} />
        </WhatsAppLink>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <div className="form-heading">
          <span className="eyebrow">LET’S PLAN SOMETHING SPECIAL</span>
          <WhatsAppIcon size={25} />
        </div>
        <div className="form-row">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              placeholder="How should we call you?"
              maxLength={100}
              required
            />
          </label>
          <label>
            Phone <span>(optional)</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Your contact number"
              maxLength={40}
            />
          </label>
        </div>
        <label>
          A place you’re dreaming of
          <select name="destination" defaultValue="">
            <option value="">I’d love your recommendations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Your message
          <textarea
            name="message"
            placeholder="A family escape, a weekend in the mountains…"
            rows={3}
            maxLength={1500}
            required
          />
        </label>
        <button className="button button-cream" type="submit">
          Continue on WhatsApp <ArrowUpRight size={18} />
        </button>
        <p className="form-note">
          Your details are passed to WhatsApp when you continue. Review your
          enquiry there before sending.
        </p>
      </form>
    </section>
  );
}
