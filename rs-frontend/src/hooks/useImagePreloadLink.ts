import { useEffect, useRef } from "react";
import { CARD_IMAGE_SIZES, cardSrcSet, proxyUrl } from "../lib/imageUrl";

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
    // imagesrcset/imagesizes must mirror the <img>, or the preload fetches a
    // width the card never asks for and the image downloads twice.
    link.href = proxyUrl(imageUrl, 640);
    link.setAttribute("imagesrcset", cardSrcSet(imageUrl));
    link.setAttribute("imagesizes", CARD_IMAGE_SIZES);
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    prevRef.current = link;

    return () => {
      link.remove();
      if (prevRef.current === link) prevRef.current = null;
    };
  }, [imageUrl]);
}
