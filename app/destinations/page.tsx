import { pageMetadata, pageSchema, jsonLd } from "@/lib/seo";
import { DestinationExplorer } from "@/components/destinations/explorer";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { getPlaces } from "@/lib/places";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Places to Visit in Abha & Aseer", "Explore mountains, heritage villages, farms, parks and waterfalls around Abha, Aseer and nearby Jazan. Find places and plan your trip on WhatsApp.", "/destinations/");
export default async function Destinations() {
  const destinations = await getPlaces();
  return (
    <main id="main" className="section destinations-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(pageSchema("Places to Visit in Abha & Aseer", "/destinations/")) }} />
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE ABHA & ASEER COLLECTION</span>
          <h1>
            Places in Abha & Aseer.
            <br />
            <em>{destinations.length} places to explore.</em>
          </h1>
        </div>
        <p>
          Follow a feeling, find a favourite.
          <br />
          Your journey starts with a little curiosity.
        </p>
      </div>
      <DestinationExplorer destinations={destinations} />
      <div className="destination-help">
        <h2>
          Still finding <em>your way?</em>
        </h2>
        <p>Tell us what you love. We’ll help you find a place.</p>
        <WhatsAppLink />
      </div>
    </main>
  );
}
