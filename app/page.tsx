import { Hero } from "@/components/home/hero";
import { MountainScene } from "@/components/home/mountain-scene";
import { WanderRibbon } from "@/components/home/wander-ribbon";
import {
  Introduction,
  FeaturedStories,
  HorizontalJourney,
  Experiences,
  About,
} from "@/components/home/editorial";
import { TripPlanner } from "@/components/home/trip-planner";
import { Contact } from "@/components/home/contact";
import { DestinationExplorer } from "@/components/destinations/explorer";
import { Gallery } from "@/components/ui/gallery";
import { Testimonials } from "@/components/ui/testimonials";
import { getPlaces } from "@/lib/places";
import { jsonLd, pageSchema } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function Home() {
const destinations = await getPlaces();
const gallery = ["rijal-alma", "art-street", "wadi-lajab", "rose-garden", "the-vineyard", "the-summer-gathering", "al-sahab-park", "lavender-park"].flatMap(slug => {
  const place = destinations.find(d => d.slug === slug);
  return place ? [place] : [];
}).map((d) => ({
  src: d.image!,
  alt: d.gallery[0].alt,
  caption: d.id === "07" ? "Rijal Alma" : d.name,
  category: d.category,
}));
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(pageSchema("Abha & Aseer Travel Guide", "/")),
        }}
      />
      <Hero />
      <Introduction />
      <MountainScene />
      <WanderRibbon />
      <FeaturedStories />
      <HorizontalJourney />
      <section className="section discovery-section" id="destinations">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR FIELD NOTES TO ASEER</span>
            <h2>
              Follow what
              <br />
              <em>moves you.</em>
            </h2>
          </div>
          <p>
            From a quiet farm to a dramatic canyon,
            <br />
            find the places that feel like you.
          </p>
        </div>
        <DestinationExplorer compact destinations={destinations} />
      </section>
      <Experiences />
      <TripPlanner destinations={destinations} />
      <section className="section gallery-section" id="gallery">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A FEW MOMENTS, WORTH KEEPING</span>
            <h2>
              Wish you
              <br />
              were <em>here.</em>
            </h2>
          </div>
          <p>
            A little colour. A little wonder.
            <br />A place in every frame.
          </p>
        </div>
        <Gallery items={gallery} />
      </section>
      <About />
      <Testimonials />
      <Contact destinations={destinations} />
    </main>
  );
}
