
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
import { WhatsAppLink } from "../ui/whatsapp-link";
import { DISPLAY_PHONE } from "@/lib/whatsapp";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>
            Your next story begins in the mountains.
            <br />
            Discover Abha, Aseer, and beyond.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/destinations/">Destinations</a>
          <a href="/#experiences">Experiences</a>
          <a href="/#about">About us</a>
        </nav>
        <nav aria-label="More links">
          <a href="/#gallery">Gallery</a>
          <a href="/#plan">Plan your trip</a>
          <a href="/#contact">Contact</a>
        </nav>
        <div>
          <p className="eyebrow">LET’S MAKE A MEMORY</p>
          <WhatsAppLink className="footer-phone">
            {DISPLAY_PHONE} <ArrowUpRight size={18} />
          </WhatsAppLink>
          <span className="footer-location">Abha / Aseer / Saudi Arabia</span>
        </div>
      </div>
      <div className="footer-word" aria-hidden="true">
        EXPLORE ABHA.
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Abha Tourist Center</span>
        <span>Made for the curious.</span>
        <a href="/credits/">Photography & information</a>
        <a href="/admin/">Owner login</a>
      </div>
    </footer>
  );
}
export function FloatingEnquiry() {
  return (
    <>
      <WhatsAppLink
        className="floating-whatsapp"
        label="Chat with Abha Tourist Center"
      >
        <span className="floating-tooltip">Chat with Abha Tourist Center</span>
      </WhatsAppLink>
      <WhatsAppLink className="mobile-enquiry">
        Plan your Abha adventure <ArrowUpRight size={18} />
      </WhatsAppLink>
    </>
  );
}
