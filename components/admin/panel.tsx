"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Plus,
  ArrowUpRight,
  ImagePlus,
  Check,
  Search,
  X,
  LoaderCircle,
} from "lucide-react";
import { categories } from "@/data/destinations";
import type { ManagedPlace } from "@/lib/places";
type Draft = {
  slug: string;
  revision: number;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  location: string;
  image: string;
  price: string;
  unit: string;
};
const empty: Draft = {
  slug: "",
  revision: 0,
  name: "",
  shortDescription: "",
  description: "",
  category: "Nature",
  location: "",
  image: "",
  price: "",
  unit: "per person",
};
export function AdminPanel({
  initialPlaces,
  ownerName,
  signOutUrl,
}: {
  initialPlaces: ManagedPlace[];
  ownerName: string;
  signOutUrl: string;
}) {
  const [places, setPlaces] = useState(initialPlaces),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState<Draft | null>(null),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit(place?: ManagedPlace) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setError("");
    setMessage("");
    setDirty(false);
    setDraft(
      place
        ? {
            slug: place.slug,
            revision: place.revision,
            name: place.name,
            shortDescription: place.shortDescription,
            description: place.description,
            category: place.category,
            location: place.location ?? "",
            image: place.image ?? "",
            price: place.packagePrice?.amount.toString() ?? "",
            unit: place.packagePrice?.unit ?? "per person",
          }
        : { ...empty },
    );
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  function change(key: keyof Draft, value: string) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setDirty(true);
    setMessage("");
  }
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image smaller than 8 MB.");
      return;
    }
    setUploading(true);
    try {
      // Resize before upload to keep new destination photos fast on phones.
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Could not prepare the image.")),
          "image/webp",
          0.88,
        ),
      );
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      const result = (await res.json()) as { error?: string; url: string };
      if (!res.ok) throw new Error(result.error || "Image upload failed.");
      change("image", result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload this photo.");
    } finally {
      setUploading(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft || uploading || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          price: draft.price === "" ? null : Number(draft.price),
        }),
      });
      const result = (await res.json()) as {
        error?: string;
        place: ManagedPlace;
      };
      if (!res.ok)
        throw new Error(result.error || "Could not save. Please try again.");
      const place = result.place as ManagedPlace;
      setPlaces((old) =>
        old.some((d) => d.slug === place.slug)
          ? old.map((d) => (d.slug === place.slug ? place : d))
          : [...old, place],
      );
      setDraft((old) =>
        old ? { ...old, slug: place.slug, revision: place.revision } : old,
      );
      setDirty(false);
      setMessage("Saved. Your changes are now live on the website.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this place.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="admin-shell">
      <div className="admin-top">
        <a href="/" className="text-link">
          View website <ArrowUpRight size={16} />
        </a>
        <a href={signOutUrl} target="_top">
          Sign out
        </a>
      </div>
      <header className="admin-heading">
        <div>
          <span className="eyebrow">OWNER’S DESK</span>
          <h1>
            A place for
            <br />
            <em>every story.</em>
          </h1>
          <p>Welcome, {ownerName}. Keep your destination collection fresh.</p>
        </div>
        <button
          className="button button-green"
          onClick={() => edit()}
          disabled={busy || uploading}
        >
          <Plus size={18} /> Add a place
        </button>
      </header>
      <div className="admin-stats">
        <span>
          <strong>{places.length}</strong> places in your collection
        </span>
        <span>
          <strong>{places.filter((p) => p.packagePrice).length}</strong> with
          package prices
        </span>
        <span className="admin-connected">
          <span /> Changes save to your website
        </span>
      </div>
      {draft && (
        <section
          className="admin-editor"
          ref={formRef}
          aria-label="Place editor"
        >
          <div className="admin-editor-heading">
            <div>
              <span className="eyebrow">
                {draft.slug ? "EDIT DESTINATION" : "A NEW DESTINATION"}
              </span>
              <h2>{draft.slug ? "Refine the details." : "Where to next?"}</h2>
            </div>
            <button
              className="admin-icon"
              aria-label="Close editor"
              disabled={busy || uploading}
              onClick={() => {
                if (!dirty || window.confirm("Discard your unsaved changes?")) {
                  setDraft(null);
                  setDirty(false);
                }
              }}
            >
              <X />
            </button>
          </div>
          <form onSubmit={save}>
            <fieldset disabled={busy || uploading}>
              <div className="admin-form-grid">
                <div className="admin-photo-field">
                  <div className="admin-photo-preview">
                    {draft.image ? (
                      <img
                        src={draft.image}
                        alt={draft.name || "Selected destination photo"}
                      />
                    ) : (
                      <div>
                        <ImagePlus size={35} />
                        <p>Start with a beautiful view.</p>
                      </div>
                    )}
                  </div>
                  <label className="button button-outline admin-upload">
                    {uploading ? (
                      <LoaderCircle size={18} className="admin-spin" />
                    ) : (
                      <ImagePlus size={18} />
                    )}{" "}
                    {uploading
                      ? "Uploading photo…"
                      : draft.image
                        ? "Change photo"
                        : "Upload a photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        void upload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <small>
                    JPG, PNG or WebP · up to 8 MB
                    <br />
                    Your photo is optimized automatically.
                  </small>
                </div>
                <div className="admin-fields">
                  <label>
                    Place name{" "}
                    <input
                      required
                      maxLength={120}
                      value={draft.name}
                      onChange={(e) => change("name", e.target.value)}
                      placeholder="e.g. Mountain View Retreat"
                    />
                  </label>
                  <div className="admin-field-row">
                    <label>
                      Category
                      <select
                        value={draft.category}
                        onChange={(e) => change("category", e.target.value)}
                      >
                        {categories
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Location <span>(optional)</span>
                      <input
                        maxLength={150}
                        value={draft.location}
                        onChange={(e) => change("location", e.target.value)}
                        placeholder="e.g. Abha, Aseer"
                      />
                    </label>
                  </div>
                  <label>
                    Short introduction{" "}
                    <textarea
                      required
                      maxLength={240}
                      rows={2}
                      value={draft.shortDescription}
                      onChange={(e) =>
                        change("shortDescription", e.target.value)
                      }
                      placeholder="A sentence visitors will see on the destination card."
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      required
                      maxLength={5000}
                      rows={6}
                      value={draft.description}
                      onChange={(e) => change("description", e.target.value)}
                      placeholder="Tell visitors what makes this place special and what they can experience."
                    />
                  </label>
                  <div className="admin-price-box">
                    <span className="eyebrow">PACKAGE PRICE · OPTIONAL</span>
                    <div className="admin-field-row">
                      <label>
                        Price in SAR
                        <input
                          type="number"
                          min="0"
                          max="1000000"
                          step="0.01"
                          value={draft.price}
                          onChange={(e) => change("price", e.target.value)}
                          placeholder="Leave blank for enquiries"
                        />
                      </label>
                      <label>
                        Price applies to
                        <select
                          value={draft.unit}
                          onChange={(e) => change("unit", e.target.value)}
                        >
                          <option>per person</option>
                          <option>per family</option>
                          <option>per group</option>
                          <option>per package</option>
                        </select>
                      </label>
                    </div>
                    <small>
                      Leave the price empty to invite enquiries. Existing
                      entry-ticket prices stay separate.
                    </small>
                  </div>
                </div>
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="admin-error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="admin-success">
                <Check size={18} />
                {message}{" "}
                <a
                  href={`/destinations/${draft.slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View place ↗
                </a>
              </p>
            )}
            <div className="admin-save">
              <span>
                {dirty ? "You have unsaved changes." : "All changes saved."}
              </span>
              <button
                className="button button-green"
                type="submit"
                disabled={busy || uploading || !draft.image}
              >
                {busy
                  ? "Saving…"
                  : draft.slug
                    ? "Save changes"
                    : "Add to website"}{" "}
                <ArrowUpRight size={18} />
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="admin-collection">
        <div className="admin-collection-heading">
          <h2>Your collection</h2>
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Search your places"
              placeholder="Find a place"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="admin-place-grid">
          {places
            .filter((p) =>
              `${p.name} ${p.location ?? ""}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((p) => (
              <article key={p.slug} className="admin-place">
                <img src={p.image ?? ""} alt={p.name} loading="lazy" />
                <div>
                  <span className="eyebrow">{p.category}</span>
                  <h3>{p.name}</h3>
                  <p>
                    {p.packagePrice
                      ? `${p.packagePrice.amount} SAR · ${p.packagePrice.unit}`
                      : "Package price on enquiry"}
                  </p>
                  <button
                    className="text-link"
                    disabled={busy || uploading}
                    onClick={() => edit(p)}
                  >
                    Edit place <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
        </div>
        {!places.some((p) =>
          `${p.name} ${p.location ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ) && <p>No places match your search.</p>}
      </section>
    </main>
  );
}
