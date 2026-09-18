import { useEffect, useState } from "react";

/**
 * "Has this element earned its entrance yet?"
 *
 * Framer's `whileInView`, and a plain IntersectionObserver, only fire when an
 * element's intersection *changes*. Jump straight past something (an anchor
 * link, a restored scroll position, a flick of the scrollbar) and it goes from
 * "below the fold, not intersecting" to "above the fold, not intersecting"
 * without ever crossing a threshold, so no callback runs and the element stays
 * invisible for good.
 *
 * So: observer for the normal case, plus a cheap position check on mount and on
 * scroll as the backstop. Everything is torn down the moment it reveals, so the
 * listeners disappear as the reader moves down the page.
 */
export default function useRevealed(ref, rootMargin = "-10% 0px -10% 0px") {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let done = false;
    let frame = 0;

    const teardown = () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", check);
      cancelAnimationFrame(frame);
    };

    const reveal = () => {
      if (done) return;
      done = true;
      setRevealed(true);
      teardown();
    };

    // Anything with a pixel on screen, or already scrolled past, which gives
    // a negative top, counts as arrived.
    const check = () => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight) reveal();
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(check);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) reveal();
      },
      { rootMargin }
    );

    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", check);
    check();

    return teardown;
  }, [ref, rootMargin]);

  return revealed;
}
