"use client";
import type { ImageLoaderProps } from "next/image";
export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (!src.startsWith("/images/destinations/")) return src;
  const size = [320, 480, 640, 960, 1280, 1920].find((w) => w >= width) ?? 1920;
  return src.replace(/\.webp$/, `-${size}.webp`);
}
