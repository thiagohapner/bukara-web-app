"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

// next/image wrapper that degrades gracefully: when the image URL fails to load
// (404 / missing file) or there is no src, it renders `fallback` (the clean
// placeholder) instead of the browser's broken-image icon. Each instance owns
// its own error state, so it works for galleries that render an array of images.
export default function ProductImage({
  fallback,
  alt,
  ...props
}: ImageProps & { fallback: React.ReactNode }) {
  const [errored, setErrored] = useState(false);
  if (errored || !props.src) return <>{fallback}</>;
  return <Image {...props} alt={alt} onError={() => setErrored(true)} />;
}
