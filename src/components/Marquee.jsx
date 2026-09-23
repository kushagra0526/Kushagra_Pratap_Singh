import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { marqueeTerms } from "../data/content";

// Percent of the strip's width per second at rest. The strip holds two copies,
// so 50% is one full pass of the terms.
const BASE_SPEED = 1.6;

/** Keeps a value cycling inside [min, max) — the loop point of the strip. */
function wrap(min, max, value) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/**
 * The hero's ticker: the intro line's own nouns running on past it, in the
 * solid-then-outlined rhythm the name is set in. It sits directly under the
 * hero rather than between two sections, so it reads as the hero closing out
 * instead of an interruption in the middle of the story.
 *
 * Driven by the page's scroll: scrolling speeds it up, scrolling back up turns
 * it round, and the pointer resting on it slows it enough to read.
 */
export default function Marquee() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const hovered = useRef(false);
  const direction = useRef(-1);

  const offset = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // px/s of scroll → multiplier on the base speed. Unclamped at the ends so a
  // fast scroll really does whip it along.
  const boost = useTransform(smoothVelocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const x = useTransform(offset, (value) => `${wrap(-50, 0, value)}%`);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "20% 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !visible) return;

    const factor = boost.get();
    // Scroll direction sets travel direction, and it holds after the scroll
    // stops — scroll back up and the strip keeps running back until you don't.
    if (factor < 0) direction.current = 1;
    else if (factor > 0) direction.current = -1;

    const speed = BASE_SPEED * (1 + Math.abs(factor)) * (hovered.current ? 0.2 : 1);
    offset.set(offset.get() + direction.current * speed * (delta / 1000));
  });

  // Two identical copies: the loop jumps back by exactly one copy's width.
  const run = [...marqueeTerms, ...marqueeTerms];

  return (
    <section
      ref={ref}
      aria-hidden="true"
      onPointerEnter={() => {
        hovered.current = true;
      }}
      onPointerLeave={() => {
        hovered.current = false;
      }}
      className="relative overflow-hidden border-y border-line py-6 select-none md:py-8"
      style={{
        // Words dissolve into the edges rather than being chopped mid-letter.
        maskImage: "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)",
      }}
    >
      <motion.div
        className="flex w-max items-center whitespace-nowrap will-change-transform"
        style={{ x: reduced ? 0 : x }}
      >
        {run.map((term, index) => {
          // Keyed to the term, not the position, so the second copy repeats
          // the first exactly — an odd term count would otherwise flip the
          // solid/outline pattern at the join and give the loop away.
          const outlined = (index % marqueeTerms.length) % 2 === 1;
          return (
            // Spacing is each item's own trailing padding, not the row's gap.
            // A gap only sits *between* items, so two copies of n items have
            // 2n-1 gaps and half the row falls half a gap short of one copy —
            // a small jump every time the loop wraps.
            <span key={`${term}-${index}`} className="flex items-center gap-7 pr-7 md:gap-10 md:pr-10">
              <span
                className={`font-display text-[clamp(1.7rem,4.6vw,3.6rem)] leading-none font-medium tracking-[-0.03em] uppercase ${
                  outlined
                    ? "text-transparent [-webkit-text-stroke:1px_rgba(255,253,238,0.45)]"
                    : "text-fg/90"
                }`}
              >
                {term}
              </span>
              <span aria-hidden="true" className="text-[0.95rem] text-gold">
                ✦
              </span>
            </span>
          );
        })}
      </motion.div>
    </section>
  );
}
