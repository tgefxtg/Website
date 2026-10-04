import { ArrowDown, Compass } from "lucide-react";
import { Photo } from "../ui/photo";

export function MountainScene() {
  return (
    <section className="mountain-scene" aria-labelledby="mountain-title">
      <div className="mountain-stage">
        <div className="mountain-window">
          <div className="mountain-landscape">
            <Photo
              src="/images/destinations/aseer-mountains.webp"
              alt="Green ridges and distant mountain ranges at Al Soudah"
              sizes="100vw"
            />
          </div>
          <div className="mountain-shade" />
          <div className="mountain-mist mist-left" aria-hidden="true" />
          <div className="mountain-mist mist-right" aria-hidden="true" />
        </div>
        <div className="mountain-overline eyebrow">
          <Compass size={18} strokeWidth={1} /> A MOMENT IN THE MOUNTAINS
        </div>
        <h2 id="mountain-title" className="mountain-title">
          <span>Take the</span>
          <em>scenic route.</em>
        </h2>
        <div className="mountain-footer">
          <p>
            Less hurry.
            <br />
            More wonder.
          </p>
          <a href="#featured" className="mountain-next">
            Discover the places <ArrowDown size={18} />
          </a>
          <span className="eyebrow">AL SOUDAH / ASEER</span>
        </div>
        <div className="mountain-meter" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
