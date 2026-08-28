import { useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";

const PRELOAD_AHEAD = 1;

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
      img.onload = img.onerror = () => {
        loadingRef.current.delete(url);
        setLoadedSet((prev) => new Set(prev).add(url));
      };
      img.src = url;
    }
  }, [projects, currentIndex, loadedSet]);

  function isLoaded(url: string | undefined): boolean {
    if (!url) return true;
    return loadedSet.has(url);
  }

  return { isLoaded };
}
