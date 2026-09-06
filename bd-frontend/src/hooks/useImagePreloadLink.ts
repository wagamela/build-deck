import { useEffect, useRef } from "react";
import { proxyUrl } from "../lib/imageUrl";

const REL = "preload";
const AS = "image";

export function useImagePreloadLink(imageUrl: string | undefined) {
  const prevRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (prevRef.current) {
      prevRef.current.remove();
      prevRef.current = null;
    }

    if (!imageUrl) return;

    const link = document.createElement("link");
    link.rel = REL;
    link.as = AS;
    link.href = proxyUrl(imageUrl, 800);
    document.head.appendChild(link);
    prevRef.current = link;

    return () => {
      link.remove();
      if (prevRef.current === link) prevRef.current = null;
    };
  }, [imageUrl]);
}
