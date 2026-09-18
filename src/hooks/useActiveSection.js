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

      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      }

      // The last section can be too short to ever reach the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && ids.length) current = ids[ids.length - 1];

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
