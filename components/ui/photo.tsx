"use client";
import Image from "next/image";
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
    <Image
      className={className}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      onError={() => setFailed(true)}
    />
  );
}
