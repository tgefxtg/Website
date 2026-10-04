import { Compass } from "lucide-react";

export function WanderRibbon() {
  return (
    <section className="wander-section" aria-labelledby="wander-title">
      <div className="wander-kicker">
        <span className="eyebrow">NO TWO JOURNEYS ALIKE</span>
        <Compass
          size={28}
          strokeWidth={1}
          className="wander-compass"
          aria-hidden="true"
        />
        <span className="eyebrow">ABHA / ASEER</span>
      </div>
      <h2 id="wander-title" className="sr-only">
        A little room to wander. A little more to feel.
      </h2>
      <div className="wander-type" aria-hidden="true">
        <div className="wander-row" data-wander-direction="-1">
          <span>
            A little room to <em>wander.</em> <i>✳</i>
          </span>
          <span>
            A little room to <em>wander.</em> <i>✳</i>
          </span>
        </div>
        <div
          className="wander-row wander-row-outline"
          data-wander-direction="1"
        >
          <span>
            A little more to <em>feel.</em> <i>✳</i>
          </span>
          <span>
            A little more to <em>feel.</em> <i>✳</i>
          </span>
        </div>
      </div>
      <div className="wander-baseline" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
