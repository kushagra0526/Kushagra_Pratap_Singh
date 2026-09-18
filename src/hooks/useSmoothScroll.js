import { useEffect } from "react";
import Lenis from "lenis";

let lenis = null;

export function getLenis() {
  return lenis;
}

/** Scroll to a section by id ("top" for the page top), through Lenis when it's running. */
export function scrollToId(id, offset = 0) {
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;

  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }

  const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}

/**
 * Inertial scrolling for the whole page. Started only once the intro has
 * cleared, and never for anyone who has asked for reduced motion.
 */
export default function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    // `anchors` lets Lenis handle plain <a href="#id"> clicks too, without it
    // a native jump gets overridden by Lenis's own scroll target.
    const instance = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    lenis = instance;

    // Someone arriving on /#work should still land there.
    if (window.location.hash.length > 1) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) requestAnimationFrame(() => instance.scrollTo(target, { immediate: true }));
    }

    let frame = requestAnimationFrame(function loop(time) {
      instance.raf(time);
      frame = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      if (lenis === instance) lenis = null;
    };
  }, [enabled]);
}
