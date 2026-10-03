export interface Testimonial {
  quote: string;
  name: string;
  permissionToPublish: boolean;
}
export function Testimonials({ reviews = [] }: { reviews?: Testimonial[] }) {
  const verified = reviews.filter((r) => r.permissionToPublish);
  if (!verified.length) return null;
  return (
    <section className="section">
      <h2>Stories from our travellers.</h2>
      {verified.map((r, i) => (
        <figure key={i}>
          <blockquote>{r.quote}</blockquote>
          <figcaption>{r.name}</figcaption>
        </figure>
      ))}
    </section>
  );
}
