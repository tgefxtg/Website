import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin, Check, Compass } from "lucide-react";
import { getPlaces, getPlace } from "@/lib/places";
import { Photo } from "@/components/ui/photo";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { Gallery } from "@/components/ui/gallery";
import { DestinationCard } from "@/components/destinations/card";
import { destinationMessage } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import { pageMetadata, pageSchema, jsonLd } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await getPlace(slug);
  if (!d) return { title: "Destination not found" };
  return pageMetadata(d.name, d.shortDescription, `/destinations/${slug}/`, d.image ?? undefined);
}
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getPlace(slug);
  if (!d) notFound();
  const related = (await getPlaces())
    .filter((x) => x.id !== d.id && x.tags.some((t) => d.tags.includes(t)))
    .slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `${site.url}/destinations/${slug}/#place`,
    name: d.name,
    description: d.shortDescription,
    url: `${site.url}/destinations/${slug}/`,
    ...(d.image ? { image: `${site.url}${d.image}` } : {}),
  };
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({ "@context": "https://schema.org", "@graph": [schema, { ...pageSchema(d.name, `/destinations/${slug}/`), mainEntity: { "@id": schema["@id"] } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` }, { "@type": "ListItem", position: 2, name: "Destinations", item: `${site.url}/destinations/` }, { "@type": "ListItem", position: 3, name: d.name, item: schema.url }] }] }),
        }}
      />
      <div className="detail-heading section">
        <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span aria-hidden="true"> / </span><Link href="/destinations/">Destinations</Link><span aria-hidden="true"> / </span><span aria-current="page">{d.name}</span></nav>
        <Link href="/destinations/" className="back-link">
          <ArrowLeft size={16} /> Back to destinations
        </Link>
        <div className="detail-title-row">
          <div>
            <span className="eyebrow">
              THE COLLECTION / {d.sourcePage ? d.id : 'NEW'} / {d.category}
            </span>
            <h1 dir="auto">{d.name}</h1>
            {d.arabicName && d.arabicName !== d.name && (
              <p className="arabic detail-arabic" lang="ar" dir="rtl">
                {d.arabicName}
              </p>
            )}
          </div>
          <p>{d.shortDescription}</p>
        </div>
      </div>
      <div className={`detail-hero ${!d.image ? "no-image" : ""}`}>
        <Photo src={d.image} alt={d.gallery[0]?.alt ?? d.name} priority />
        {d.location && (
          <span className="detail-location">
            <MapPin size={15} />
            {d.location}
          </span>
        )}
      </div>
      <section className="section detail-overview">
        <div className="detail-description" data-reveal>
          <span className="eyebrow">GET TO KNOW THE PLACE</span>
          <h2>
            A little more
            <br />
            <em>to discover.</em>
          </h2>
          <p>{d.description}</p>
          {d.highlights.length > 0 && <h3>The moments to look for</h3>}
          <ul className="highlights">
            {d.highlights.map((x) => (
              <li key={x}>
                <Check size={16} />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <aside className="visit-card">
          <Compass size={35} strokeWidth={1} />
          <h3>
            Make it part
            <br />
            of your journey.
          </h3>
          {d.packagePrice && <div className="ticket-information"><span className="eyebrow">PACKAGE PRICE</span><p><strong>{d.packagePrice.amount} SAR</strong> <span>{d.packagePrice.unit}</span></p></div>}
          {d.ticketPrice && (
            <div className="ticket-information">
              <span className="eyebrow">REFERENCE ENTRY PRICE</span>
              <p>
                <strong>{d.ticketPrice.amount} SAR</strong>{" "}
                <span>{d.ticketPrice.unit}</span>
              </p>
              {d.ticketPrice.note && <p>{d.ticketPrice.note}</p>}
              <small>
                Listed in the supplied guide. Confirm the current price before
                your visit.
              </small>
            </div>
          )}
          <WhatsAppLink message={destinationMessage(d.name)}>
            Ask about this place
          </WhatsAppLink>
          {d.mapUrl && (
            <a
              className="button button-outline"
              href={d.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={17} />
              View location
              <ArrowUpRight size={17} />
            </a>
          )}
          <small>
            We’ll help you check access, availability, and the best way to
            include this stop.
          </small>
        </aside>
      </section>
      {d.gallery.length > 1 && (
        <section className="section detail-gallery">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A CLOSER LOOK</span>
              <h2>
                Postcards from <em>here.</em>
              </h2>
            </div>
            <p>Explore the photographs.</p>
          </div>
          <Gallery
            variant="detail"
            items={d.gallery.map((x, i) => ({
              ...x,
              caption: `${d.name} · ${i + 1}`,
            }))}
          />
        </section>
      )}
      <section className="section related-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LET THE JOURNEY CONTINUE</span>
            <h2>
              A few more
              <br />
              <em>possibilities.</em>
            </h2>
          </div>
          <Link className="text-link" href="/destinations/">
            All destinations
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="destination-grid">
          {related.map((x) => (
            <DestinationCard key={x.id} destination={x} />
          ))}
        </div>
      </section>
    </main>
  );
}
