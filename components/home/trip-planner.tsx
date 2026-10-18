"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Compass, ArrowUpRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { tripMessage } from "@/lib/whatsapp";
import { Photo } from "../ui/photo";
import { WhatsAppLink } from "../ui/whatsapp-link";
import { registerPageTool } from "@/lib/webmcp";
const interests = [
  "Nature",
  "Adventure",
  "Family",
  "Heritage",
  "Farms",
  "Mountains",
  "Relaxation",
];
export function TripPlanner({destinations}:{destinations:Destination[]}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  useEffect(
    () =>
      registerPageTool({
        name: "configure_trip_wishlist",
        title: "Configure trip wish list",
        description:
          "Stage interests and destinations in the visible trip planner. Returns a WhatsApp draft link. Does not open WhatsApp or send a message.",
        inputSchema: {
          type: "object",
          properties: {
            interests: {
              type: "array",
              items: { type: "string", enum: interests },
            },
            destinationSlugs: {
              type: "array",
              items: { type: "string", enum: destinations.map((d) => d.slug) },
            },
          },
          required: ["interests", "destinationSlugs"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          if (!input || typeof input !== "object")
            throw new Error("Expected interests and destinationSlugs arrays");
          const value = input as Record<string, unknown>;
          if (
            !Array.isArray(value.interests) ||
            !value.interests.every(
              (x) => typeof x === "string" && interests.includes(x),
            ) ||
            !Array.isArray(value.destinationSlugs) ||
            !value.destinationSlugs.every(
              (x) =>
                typeof x === "string" && destinations.some((d) => d.slug === x),
            )
          )
            throw new Error(
              "Choose only listed interests and destination slugs",
            );
          const nextInterests = [...new Set(value.interests as string[])],
            nextPlaces = [...new Set(value.destinationSlugs as string[])];
          setSelected(nextInterests);
          setPlaces(nextPlaces);
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          return {
            status: "staged",
            interests: nextInterests,
            destinations: destinations
              .filter((d) => nextPlaces.includes(d.slug))
              .map((d) => d.name),
            message: tripMessage(
              nextInterests,
              destinations
                .filter((d) => nextPlaces.includes(d.slug))
                .map((d) => d.name),
            ),
          };
        },
      }),
    [destinations],
  );
  const recommended = useMemo(
    () =>
      destinations
        .filter((d) =>
          selected.length
            ? d.tags.some((t) => selected.includes(t))
            : d.featured,
        )
        .slice(0, 6),
    [selected, destinations],
  );
  const toggleInterest = (name: string) =>
    setSelected((old) =>
      old.includes(name) ? old.filter((x) => x !== name) : [...old, name],
    );
  const togglePlace = (slug: string) =>
    setPlaces((old) =>
      old.includes(slug) ? old.filter((x) => x !== slug) : [...old, slug],
    );
  const selectedDestinations = destinations.filter((d) =>
    places.includes(d.slug),
  );
  return (
    <section id="plan" className="planner-section section">
      <div className="planner-heading" data-reveal>
        <span className="eyebrow">A JOURNEY THAT FEELS LIKE YOU</span>
        <h2>
          Your Abha.
          <br />
          <em>Your way.</em>
        </h2>
        <p>
          A mountain morning? A day among the farms?
          <br />
          Start with what you love. We’ll help with the rest.
        </p>
        <Compass size={70} strokeWidth={0.7} className="planner-compass" />
      </div>
      <div className="planner-panel">
        <div className="planner-step">
          <span>01</span>
          <h3>What draws you here?</h3>
          <small>Choose a few favourites</small>
        </div>
        <div
          className="interest-pills"
          role="group"
          aria-label="Trip interests"
        >
          {interests.map((x) => (
            <button
              key={x}
              aria-pressed={selected.includes(x)}
              onClick={() => toggleInterest(x)}
            >
              {selected.includes(x) ? <Check size={16} /> : <Plus size={16} />}{" "}
              {x}
            </button>
          ))}
        </div>
        <div className="planner-step">
          <span>02</span>
          <h3>Make a little wish list</h3>
          <small aria-live="polite">{places.length} selected</small>
        </div>
        <div className="planner-recommendations">
          {recommended.map((d) => (
            <button
              key={d.slug}
              className={`planner-place ${places.includes(d.slug) ? "selected" : ""}`}
              aria-pressed={places.includes(d.slug)}
              onClick={() => togglePlace(d.slug)}
            >
              <span className="planner-thumb">
                <Photo src={d.image} alt="" sizes="80px" />
              </span>
              <span>
                <strong dir="auto">{d.name}</strong>
                <small>{d.category}</small>
              </span>
              <span className="selection-check">
                {places.includes(d.slug) ? (
                  <Check size={14} />
                ) : (
                  <Plus size={14} />
                )}
              </span>
            </button>
          ))}
        </div>
        {selectedDestinations.length > 0 && (
          <div
            className="chosen-places"
            aria-label="Your selected destinations"
          >
            {selectedDestinations.map((d) => (
              <button
                key={d.slug}
                onClick={() => togglePlace(d.slug)}
                aria-label={`Remove ${d.name} from trip`}
              >
                {d.name}
                <span>×</span>
              </button>
            ))}
          </div>
        )}
        <div className="planner-send">
          <WhatsAppLink
            message={tripMessage(
              selected,
              selectedDestinations.map((d) => d.name),
            )}
          >
            Send my trip request <ArrowUpRight size={18} />
          </WhatsAppLink>
          <p>
            Your wish list opens in WhatsApp.
            <br />
            No account. Just a conversation.
          </p>
        </div>
      </div>
    </section>
  );
}
