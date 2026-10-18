"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Photo } from "./photo";
export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  category?: string;
}
export function Gallery({
  items,
  variant = "editorial",
}: {
  items: GalleryItem[];
  variant?: "editorial" | "detail";
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (active !== null) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
      trigger.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);
  const shift = (direction: number) =>
    setActive((i) =>
      i === null ? null : (i + direction + items.length) % items.length,
    );
  return (
    <>
      <div className={`gallery-grid ${variant}`}>
        {items.map((item, i) => (
          <button
            key={item.src}
            className="gallery-image"
            onClick={(e) => {
              trigger.current = e.currentTarget;
              setActive(i);
            }}
          >
            <Photo
              src={item.src}
              alt={item.alt}
              sizes="(max-width: 600px) 90vw, 45vw"
            />
            <span className="gallery-caption">
              <span>
                <small>{item.category}</small>
                {item.caption}
              </span>
              <ArrowUpRight size={20} />
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Photo gallery"
        onCancel={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActive(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") shift(-1);
          if (e.key === "ArrowRight") shift(1);
        }}
      >
        <button
          className="lightbox-close icon-button"
          onClick={() => setActive(null)}
          aria-label="Close gallery"
        >
          <X />
        </button>
        {active !== null && (
          <>
            <div className="lightbox-image" key={items[active].src}>
              <Photo
                src={items[active].src}
                alt={items[active].alt}
                sizes="90vw"
              />
            </div>
            <div className="lightbox-toolbar">
              <button
                className="icon-button"
                onClick={() => shift(-1)}
                aria-label="Previous photo"
              >
                <ArrowLeft />
              </button>
              <p aria-live="polite">
                {items[active].caption}
                <small>
                  {active + 1} / {items.length}
                </small>
              </p>
              <button
                className="icon-button"
                onClick={() => shift(1)}
                aria-label="Next photo"
              >
                <ArrowRight />
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
