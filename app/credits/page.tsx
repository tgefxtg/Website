import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Photography & information",
  description:
    "Sources and image credits for the Abha Tourist Center destination collection.",
  alternates: { canonical: "/credits/" },
};
export default function Credits() {
  return (
    <main id="main" className="section credits-page">
      <span className="eyebrow">BEHIND THE COLLECTION</span>
      <h1>
        Photography
        <br />& <em>information.</em>
      </h1>
      <section>
        <h2>Aseer Explore</h2>
        <p>
          The destination collection, original gallery photographs, reference prices,
          and map links are based on “Aseer Explore – Nasik Ahammed”, supplied
          to Abha Tourist Center as a content reference. Names in Arabic are
          preserved where supplied.
        </p>
        <p>
          Images have been extracted, resized and converted to WebP for this
          website. Original photography quality varies.
        </p>
      </section>
      <section>
        <h2>Selected destination images</h2>
        <p>
          The main images for 22 destinations were supplied and selected by
          Abha Tourist Center. They appear throughout the destination cards,
          featured stories and destination pages. Additional gallery photographs
          remain from the Aseer Explore reference. Images are resized and
          converted to WebP for responsive display.
        </p>
      </section>
      <section>
        <h2>The mountain panorama</h2>
        <p>
          <a
            href="https://commons.wikimedia.org/wiki/File:Al_Sowda_Hill_top_04.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Al Sowda Hill top 04
          </a>{" "}
          by{" "}
          <a
            href="https://commons.wikimedia.org/wiki/User:Irshadpp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Irshadpp
          </a>
          , via Wikimedia Commons, licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 4.0
          </a>
          . Resized, converted to WebP and cropped responsively for display; the
          adapted photograph remains under the same license.
        </p>
      </section>
      <section>
        <h2>Planning your visit</h2>
        <p>
          Entry prices are reference values from the supplied guide, rather than
          live quotes. Seasonal activities, access, water flow and operating
          arrangements may change. Please confirm details with Abha Tourist
          Center when planning your visit.
        </p>
        <p>
          Location links are reproduced from the reference. A malformed link for
          The Summer Gathering is omitted. Coordinates and opening hours have
          not been added. The historical mosque retains its supplied destination
          name; conflicting dates in the reference have not been repeated.
        </p>
      </section>
      <section>
        <h2>Your enquiries</h2>
        <p>
          Trip plans and contact details are prepared in your browser and passed
          to WhatsApp only when you choose to continue. The website does not
          store your enquiry in a database. You can review the message in
          WhatsApp before sending.
        </p>
      </section>
    </main>
  );
}
