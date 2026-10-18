import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin, Compass } from "lucide-react";
import { Photo } from "../ui/photo";
import { WhatsAppLink } from "../ui/whatsapp-link";
import { getPlace } from "@/lib/places";
export async function Hero() {
  const village = await getPlace('rijal-alma');
  return (
    <section className="magazine-hero" aria-labelledby="hero-title">
      <div className="magazine-hero-copy">
        <div className="issue-label">
          <span className="eyebrow">THE ART OF EXPLORING</span>
          <span>01 / ASEER</span>
        </div>
        <div className="hero-content">
          <h1 id="hero-title">
            <span className="hero-line">
              <span>Explore Abha.</span>
            </span>
            <span className="hero-line">
              <span>Discover</span>
            </span>
            <span className="hero-line">
              <span>
                <em>Aseer.</em>
              </span>
            </span>
          </h1>
          <p className="hero-reveal">
            Cloud-covered mountains. Stories in stone.
            <br />A quieter, greener side of Saudi Arabia.
            <br />
            Let your curiosity lead you to Abha.
          </p>
          <div className="hero-actions hero-reveal">
            <Link
              className="button button-green"
              href="/destinations/"
              data-magnetic
            >
              Explore destinations <ArrowUpRight size={18} />
            </Link>
            <Link className="hero-plan text-link" href="#plan">
              Plan your trip
            </Link>
          </div>
        </div>
        <div className="hero-footnote">
          <span className="hero-small-photo">
            <Photo
              src={village?.image ?? null}
              alt={village?.name ?? "Rijal Alma"}
              sizes="160px"
            />
          </span>
          <div>
            <span className="eyebrow">A PLACE TO FEEL.</span>
            <p>Not just somewhere to go.</p>
            <WhatsAppLink className="hero-editorial-chat">
              Let’s make a journey
            </WhatsAppLink>
          </div>
        </div>
      </div>
      <div className="magazine-hero-visual">
        <div className="hero-photo">
          <Photo
            src="/images/destinations/aseer-mountains.webp"
            alt="Layers of green mountains disappearing into mist at Al Soudah, Aseer"
            priority
            sizes="(max-width: 800px) 100vw, 55vw"
          />
        </div>
        <div className="hero-fog" aria-hidden="true" />
        <div className="hero-photo-top">
          <MapPin size={13} />
          <span>AL SOUDAH · ASEER</span>
        </div>
        <div className="hero-photo-bottom">
          <span>
            A little closer
            <br />
            <em>to the clouds.</em>
          </span>
          <a
            href="#intro"
            className="hero-scroll"
            aria-label="Scroll to discover Abha"
          >
            <ArrowDown size={25} />
          </a>
        </div>
        <div className="hero-caption">
          <span>A DIFFERENT SIDE OF SAUDI</span>
          <Compass size={16} />
        </div>
      </div>
    </section>
  );
}
