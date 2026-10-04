import Link from "next/link";
import { ArrowUpRight, Mountain, Leaf, Landmark, Sparkles } from "lucide-react";
import { destinations, featuredDestinations } from "@/data/destinations";
import { destinationMessage } from "@/lib/whatsapp";
import { Photo } from "../ui/photo";
import { WhatsAppLink } from "../ui/whatsapp-link";
export function Introduction() {
  return (
    <section id="intro" className="section editorial-intro">
      <span className="eyebrow section-kicker">
        01 — A DIFFERENT SIDE OF SAUDI
      </span>
      <div>
        <h2 data-scroll-words>
          <span>Where</span> <span>the</span> <span>mountains</span>
          <br />
          <span>meet</span>{" "}
          <em>
            <span>the</span> <span>clouds.</span>
          </em>
        </h2>
        <div className="intro-columns">
          <p data-reveal>
            Take the winding road. Follow the fog. Find a village that tells its
            story in stone. There’s a different rhythm to life here in Abha and
            Aseer.
          </p>
          <p data-reveal>
            From mountain viewpoints and jacaranda-lined streets to family farms
            and hidden waterfalls, we’ll help you find a journey that feels like
            your own.
          </p>
        </div>
        <div className="intro-stats">
          <div>
            <strong data-count="30">30</strong>
            <span>PLACES TO DISCOVER</span>
          </div>
          <div>
            <Mountain size={31} strokeWidth={1} />
            <span>MOUNTAIN MOMENTS</span>
          </div>
          <div>
            <Landmark size={31} strokeWidth={1} />
            <span>NATURE & HERITAGE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function FeaturedStories() {
  const stories = [destinations[2], destinations[6], destinations[1]];
  const headings = [
    <>
      <span className="story-title-line">
        <span>On the edge</span>
      </span>{" "}
      <span className="story-title-line">
        <span>
          of <em>the clouds.</em>
        </span>
      </span>
    </>,
    <>
      <span className="story-title-line">
        <span>Every stone</span>
      </span>{" "}
      <span className="story-title-line">
        <span>
          has <em>a story.</em>
        </span>
      </span>
    </>,
    <>
      <span className="story-title-line">
        <span>A city, dressed</span>
      </span>{" "}
      <span className="story-title-line">
        <span>
          in <em>jacaranda.</em>
        </span>
      </span>
    </>,
  ];
  return (
    <section
      id="featured"
      className="featured-stories"
      aria-label="Featured destination stories"
    >
      <div className="section stories-heading">
        <span className="eyebrow">THE PLACES THAT STAY WITH YOU</span>
        <h2>
          Some journeys
          <br />
          are <em>felt.</em>
        </h2>
        <span className="stories-intro">
          Three places to begin.
          <br />A thousand reasons to linger.
        </span>
      </div>
      {stories.map((d, i) => (
        <article className={`feature-story story-${i}`} key={d.id}>
          <div className="feature-image">
            <Photo
              src={i === 0 ? d.gallery[1].src : d.image}
              alt={i === 0 ? d.gallery[1].alt : d.gallery[0].alt}
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <span className="feature-image-index">0{i + 1} / 03</span>
          </div>
          <div className="feature-story-copy">
            <span className="eyebrow">
              {d.category} {d.location && ` / ${d.location}`}
            </span>
            <h3>{headings[i]}</h3>
            <p>{d.shortDescription}</p>
            <div className="feature-story-footer">
              <span>
                {d.name === "Rijal Alma Museum (Heritage Village)"
                  ? "Rijal Alma Heritage Village"
                  : d.name}
              </span>
              <Link href={`/destinations/${d.slug}/`} className="text-link">
                Explore <ArrowUpRight size={18} />
              </Link>
              <WhatsAppLink
                className="story-chat"
                message={destinationMessage(d.name)}
                label={`Ask about ${d.name}`}
              >
                {null}
              </WhatsAppLink>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
export function HorizontalJourney() {
  return (
    <section
      id="journey"
      className="journey-section"
      aria-labelledby="journey-title"
    >
      <div className="journey-pin">
        <div className="journey-header">
          <div>
            <p className="eyebrow">KEEP YOUR CURIOSITY MOVING</p>
            <h2 id="journey-title">
              30 places.
              <br />
              <em>Endless memories.</em>
            </h2>
          </div>
          <p>
            One region. So many ways to feel alive.
            <br />
            <span className="desktop-journey-hint">
              Scroll to travel a little further.
            </span>
            <span className="mobile-journey-hint">
              Swipe to find your next stop.
            </span>
          </p>
        </div>
        <div className="journey-viewport">
          <div className="journey-track">
            {featuredDestinations.map((d) => (
              <article className="journey-card" key={d.id}>
                <Link
                  href={`/destinations/${d.slug}/`}
                  className="journey-photo"
                >
                  <Photo
                    src={d.image}
                    alt={d.gallery[0].alt}
                    sizes="(max-width:800px) 80vw, 42vw"
                  />
                  <span className="journey-number">{d.id}</span>
                  <span className="journey-card-title">
                    <small>{d.category}</small>
                    <strong>
                      {d.id === "07"
                        ? "Rijal Alma"
                        : d.name.replace(" Water Falls", "")}
                    </strong>
                    <ArrowUpRight size={26} />
                  </span>
                </Link>
                <WhatsAppLink
                  className="journey-chat"
                  message={destinationMessage(d.name)}
                >
                  Ask about this place
                </WhatsAppLink>
              </article>
            ))}
          </div>
        </div>
        <div className="journey-progress">
          <span />
        </div>
        <div className="journey-chapters" aria-hidden="true">
          <span>SELECTED FIELD NOTES</span>
          <span>
            <b className="journey-current">01</b> /{" "}
            {String(featuredDestinations.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
export function Experiences() {
  return (
    <section id="experiences" className="section experiences">
      <div className="experiences-heading">
        <span className="eyebrow">MORE THAN A BEAUTIFUL VIEW</span>
        <h2>
          Find your
          <br />
          <em>kind of wonder.</em>
        </h2>
        <p>
          There’s no single way to experience Aseer.
          <br />
          Only the one that stays with you.
        </p>
        <Link href="#plan" className="text-link">
          Make it your journey <ArrowUpRight size={18} />
        </Link>
        <div className="experience-chapters" aria-hidden="true">
          <span className="experience-chapter is-current">01 — Mountains</span>
          <span className="experience-chapter">02 — Heritage</span>
          <span className="experience-chapter">03 — Slow living</span>
        </div>
      </div>
      <div className="experience-stories">
        {[
          {
            icon: Mountain,
            title: "Above the clouds",
            text: "Mountain air, changing skies, and a little space to breathe.",
            image: destinations[2].gallery[3].src,
            link: destinations[2].slug,
          },
          {
            icon: Landmark,
            title: "Heritage, held close",
            text: "Stone-built villages and art that carries the character of Aseer.",
            image: destinations[6].gallery[2].src,
            link: destinations[6].slug,
          },
          {
            icon: Leaf,
            title: "The joy of slowing down",
            text: "Leafy paths, fresh fruit, and time together on the farms.",
            image: destinations[12].gallery[1].src,
            link: destinations[12].slug,
          },
        ].map((x, i) => (
          <article key={x.title} className="experience-story" data-reveal>
            <div className="experience-image">
              <Photo
                src={x.image}
                alt={x.title}
                sizes="(max-width:800px) 90vw, 44vw"
              />
            </div>
            <div>
              <span className="eyebrow">
                0{i + 1} / <x.icon size={14} />
              </span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <Link
                href={`/destinations/${x.link}/`}
                aria-label={`Explore ${x.title}`}
                className="experience-arrow"
              >
                <ArrowUpRight size={23} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function About() {
  return (
    <section id="about" className="section about-section">
      <div className="about-image" data-image-reveal>
        <Photo
          src={destinations[12].gallery[2].src}
          alt="Shaded seating beneath grapevines at The Vineyard"
          sizes="(max-width:800px) 90vw, 40vw"
        />
        <span>TAKE A SEAT. STAY A LITTLE LONGER.</span>
      </div>
      <div className="about-copy" data-reveal>
        <span className="eyebrow">MEET ABHA TOURIST CENTER</span>
        <h2>
          A local beginning.
          <br />
          <em>Your own story.</em>
        </h2>
        <p>
          We’re a tourism discovery and enquiry service for Abha, Aseer, and
          nearby destinations. We bring the region’s places together, so you can
          find what speaks to you.
        </p>
        <p>
          Start with a mountain, a village, or simply a feeling. Tell us what
          you’re imagining, and let’s explore the possibilities together.
        </p>
        <WhatsAppLink className="text-link">Start a conversation</WhatsAppLink>
        <Sparkles size={30} strokeWidth={1} className="about-spark" />
      </div>
    </section>
  );
}
