import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { destinationMessage } from "@/lib/whatsapp";
import { Photo } from "../ui/photo";
import { WhatsAppLink } from "../ui/whatsapp-link";
export function DestinationCard({
  destination: d,
}: {
  destination: Destination;
}) {
  return (
    <article className="destination-card">
      <div className="card-photo" data-tilt>
        <Link
          href={`/destinations/${d.slug}/`}
          aria-label={`Explore ${d.name}`}
        >
          <Photo
            src={d.image}
            alt={d.gallery[0]?.alt ?? d.name}
            sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 29vw"
          />
        </Link>
        <span className="card-number">{d.id}</span>
        <WhatsAppLink
          message={destinationMessage(d.name)}
          label={`Ask about ${d.name} on WhatsApp`}
          className="card-whatsapp"
        >
          {null}
        </WhatsAppLink>
      </div>
      <div className="card-copy">
        <span className="eyebrow">{d.category}</span>
        <h3 dir="auto">
          <Link href={`/destinations/${d.slug}/`}>{d.name}</Link>
        </h3>
        <p>{d.shortDescription}</p>
        <Link href={`/destinations/${d.slug}/`} className="card-explore">
          Explore destination <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
