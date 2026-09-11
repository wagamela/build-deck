import { useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";
import { CARD_IMAGE_SIZES, cardSrcSet, proxyUrl } from "../lib/imageUrl";

const PRELOAD_AHEAD = typeof window !== "undefined" && window.innerWidth < 640 ? 0 : 1;

export function useImagePreloader(projects: Project[], currentIndex: number) {
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());
  const loadingRef = useRef(new Map<string, HTMLImageElement>());

  useEffect(() => {
    const toPreload = projects
      .slice(currentIndex, currentIndex + PRELOAD_AHEAD)
      .map((p) => p.image)
      .filter((url): url is string => !!url && !loadedSet.has(url));

    for (const url of toPreload) {
      if (loadingRef.current.has(url)) continue;

      const img = new Image();
      loadingRef.current.set(url, img);
      img.onload = () => {
        loadingRef.current.delete(url);
        setLoadedSet((prev) => new Set(prev).add(url));
      };
      img.onerror = () => {
        loadingRef.current.delete(url);
      };
      // Mirror the card's srcSet/sizes so the browser resolves this preload to
      // the same candidate the card will render, and reuses it from cache.
      img.sizes = CARD_IMAGE_SIZES;
      img.srcset = cardSrcSet(url);
      img.src = proxyUrl(url, 640);
    }
  }, [projects, currentIndex, loadedSet]);

  function isLoaded(url: string | undefined): boolean {
    if (!url) return true;
    return loadedSet.has(url);
  }

  return { isLoaded };
}
