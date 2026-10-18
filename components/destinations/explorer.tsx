"use client";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { categories, type Destination, type Category } from "@/data/destinations";
import { DestinationCard } from "./card";
export function DestinationExplorer({
  compact = false,
  destinations,
}: {
  compact?: boolean;
  destinations: Destination[];
}) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const results = useMemo(
    () =>
      destinations.filter(
        (d) =>
          (category === "All" || d.tags.includes(category)) &&
          `${d.name} ${d.arabicName ?? ""} ${d.location ?? ""} ${d.tags.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [category, query, destinations],
  );
  const visible = compact && !expanded ? results.slice(0, 6) : results;
  return (
    <div className="explorer">
      <div className="explorer-controls">
        <div
          className="category-filters"
          role="group"
          aria-label="Filter destinations by category"
        >
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setExpanded(false);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search destinations</span>
          <input
            type="search"
            placeholder="Find your next escape"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpanded(false);
            }}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="explorer-meta">
        <span aria-live="polite">
          {results.length} {results.length === 1 ? "place" : "places"} to
          discover
        </span>
        <span>YOUR JOURNEY, YOUR PACE</span>
      </div>
      <div
        className="destination-grid"
        key={`${category}-${query}`}
        id="destination-results"
      >
        {visible.map((d) => (
          <DestinationCard key={d.id} destination={d} />
        ))}
      </div>
      {!results.length && (
        <div className="empty-results">
          <h3>A different path, perhaps?</h3>
          <p>Try another name or explore all destinations.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
          >
            Show all destinations
          </button>
        </div>
      )}
      {compact && !expanded && results.length > 6 && (
        <div className="load-more">
          <button
            className="button button-outline"
            onClick={() => setExpanded(true)}
            aria-controls="destination-results"
          >
            Explore all {results.length} places <span>+</span>
          </button>
        </div>
      )}
    </div>
  );
}
