import { useEffect, useState } from "react";

/**
 * Which section the reader is in, for the nav highlight. Worked out from
 * positions on every scroll frame rather than an IntersectionObserver, so a
 * jump straight to the bottom of the page still lands on the right item.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const line = window.innerHeight * 0.4;
      let current = null;
      let currentTop = -Infinity;
      let lowest = null;
      let lowestTop = -Infinity;

      // Decided by position on the page, not position in `ids`. Taking "the
      // last id that has crossed the line" only works while the array happens
      // to be in page order; one id added out of order and it wins everywhere
      // below it — which is how the status bar came to read "Activity" at
      // Stack, Highlights and Contact alike.
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top <= line && top > currentTop) {
          current = id;
          currentTop = top;
        }
        if (top > lowestTop) {
          lowest = id;
          lowestTop = top;
        }
      }

      // The last section can be too short to ever reach the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && lowest) current = lowest;

      setActive(current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}
