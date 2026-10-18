import Link from "next/link";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <main id="main" className="section not-found">
      <Compass size={60} strokeWidth={1} />
      <span className="eyebrow">A LITTLE OFF THE BEATEN PATH</span>
      <h1>
        Let’s find
        <br />
        <em>your way back.</em>
      </h1>
      <p>
        This page couldn’t be found. Explore the destination collection to find your next journey.
      </p>
      <Link className="button button-green" href="/destinations/">
        Explore destinations
      </Link>
    </main>
  );
}
