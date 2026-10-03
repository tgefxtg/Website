import type { Metadata } from "next";
import { DestinationExplorer } from "@/components/destinations/explorer";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
export const metadata: Metadata = {
  title: "30 places to discover in Abha & Aseer",
  description:
    "Find your next escape among 30 destinations: mountains, heritage villages, farms, parks and waterfalls around Abha, Aseer and nearby Jazan.",
  alternates: { canonical: "/destinations/" },
  openGraph: {
    title: "30 places to discover in Abha & Aseer",
    description:
      "Explore mountains, villages, farms, parks and waterfalls, and plan your journey with Abha Tourist Center.",
    url: "/destinations/",
  },
  twitter: {
    title: "30 places to discover in Abha & Aseer",
    description: "A collection of mountain escapes, farms and heritage places.",
  },
};
export default function Destinations() {
  return (
    <main id="main" className="section destinations-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE ABHA & ASEER COLLECTION</span>
          <h1>
            Thirty places.
            <br />
            <em>Your next chapter.</em>
          </h1>
        </div>
        <p>
          Follow a feeling, find a favourite.
          <br />
          Your journey starts with a little curiosity.
        </p>
      </div>
      <DestinationExplorer />
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
