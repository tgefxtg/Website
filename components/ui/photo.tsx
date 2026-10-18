"use client";
import { useState } from "react";
import { ImageOff } from "lucide-react";
export function Photo({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <div className={`photo-placeholder ${className}`}>
        <ImageOff size={28} strokeWidth={1} />
        <span>{failed ? "Image unavailable" : "Photography coming soon"}</span>
        <small>{alt}</small>
      </div>
    );
  return (
    <img
      className={className}
      src={src}
      srcSet={src.startsWith("/images/destinations/") ? [320,480,640,960,1280,1920].map(w => `${src.replace(/\.webp$/, `-${w}.webp`)} ${w}w`).join(", ") : undefined}
      alt={alt}
      width={1920}
      height={1280}
      style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
    />
  );
}
