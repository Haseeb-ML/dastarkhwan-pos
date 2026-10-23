import React, { useState, useEffect } from "react";
import { cacheExternalImage, getImageFromIndexedDb } from "./imageCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
  alt?: string;
}

export default function CachedImage({
  src,
  fallback = "/media/curry.jpg",
  alt = "",
  className = "",
  style,
  ...props
}: CachedImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!src) return fallback;
    return src;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setResolvedSrc(fallback);
      return;
    }

    // If it's already a data URL, use it directly and ensure it's in IndexedDB
    if (src.startsWith("data:")) {
      setResolvedSrc(src);
      return;
    }

    // Try to get from local cache first
    getImageFromIndexedDb(src).then((cached) => {
      if (isMounted && cached) {
        setResolvedSrc(cached);
      }
    });

    // In parallel, ensure it is fetched and cached
    cacheExternalImage(src).then((cachedUrl) => {
      if (isMounted && cachedUrl && cachedUrl !== src) {
        setResolvedSrc(cachedUrl);
      }
    }).catch(() => {
      // Keep existing
    });

    return () => {
      isMounted = false;
    };
  }, [src, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (resolvedSrc !== fallback) {
        setResolvedSrc(fallback);
      }
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
