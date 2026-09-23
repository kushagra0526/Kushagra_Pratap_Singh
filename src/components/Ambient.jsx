import React, { useMemo, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

// Deterministic, so the starfield never reshuffles between paints.
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Three fields, not five: blur+blend layers this large are genuinely
// expensive to composite, and three overlapping fields already read as one
// continuous wash, so the extra two were cost without a visible difference.
// Same blue/orange/olive family the site has always used. Each field is
// large enough to overlap deep into its neighbour and fades out gradually
// across its full radius (down to 0 by the edge, not cut off partway) —
// a short, sharp falloff is what read as a "blob" instead of a blend.
const FIELDS = [
  {
    css: "left-[-22%] top-[-32%] h-[100vmax] w-[100vmax]",
    stops:
      "rgba(58,86,214,0.7) 0%, rgba(58,86,214,0.4) 24%, rgba(58,86,214,0.18) 46%, rgba(58,86,214,0.07) 66%, transparent 100%",
    animation: "drift-a 34s ease-in-out infinite",
  },
  {
    css: "right-[-24%] top-[-26%] h-[104vmax] w-[104vmax]",
    stops:
      "rgba(214,84,42,0.6) 0%, rgba(214,84,42,0.32) 26%, rgba(214,84,42,0.14) 48%, rgba(214,84,42,0.05) 68%, transparent 100%",
    animation: "drift-c 38s ease-in-out infinite",
  },
  {
    css: "left-[-12%] bottom-[-30%] h-[70vmax] w-[70vmax]",
    stops:
      "rgba(186,206,74,0.4) 0%, rgba(186,206,74,0.2) 28%, rgba(186,206,74,0.08) 52%, transparent 100%",
    animation: "drift-b 50s ease-in-out infinite",
  },
];

const FADE_OUT_AT = 1300; // px scrolled before the sky fully stops

/**
 * The lit sky behind the first screen: colour fields that drift, then drop
 * away entirely as you scroll into the story. Past FADE_OUT_AT it's not just
 * transparent, it's unmounted, so there's no ongoing blur/blend cost sitting
 * behind sections that never show it.
 */
export default function Ambient() {
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);

  const lift = useTransform(scrollY, [0, FADE_OUT_AT], [0, -260]);
  const fade = useTransform(scrollY, [0, 900, FADE_OUT_AT], [1, 0.75, 0]);

  useMotionValueEvent(scrollY, "change", (value) => {
    setPastHero((was) => (value > FADE_OUT_AT + 40 ? true : value < FADE_OUT_AT - 40 ? false : was));
  });

  const stars = useMemo(() => {
    const random = mulberry32(20260915);
    return Array.from({ length: 40 }, () => ({
      x: random() * 100,
      y: random() * 100,
      size: random() < 0.86 ? 1 : 2,
      delay: random() * 7,
      duration: 5 + random() * 5,
      base: 0.12 + random() * 0.4,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-bg" />

      {pastHero ? null : (
        <motion.div
          className="absolute inset-x-0 top-0 h-[130vh]"
          style={reduced ? undefined : { y: lift, opacity: fade }}
        >
          <div className="absolute inset-0 isolate">
            {FIELDS.map((field) => (
              <div
                key={field.css}
                className={`absolute rounded-full mix-blend-screen ${field.css}`}
                style={{
                  background: `radial-gradient(closest-side, ${field.stops})`,
                  filter: "blur(36px)",
                  animation: reduced ? undefined : field.animation,
                }}
              />
            ))}
          </div>

          {/* settle the whole thing back towards navy at the bottom edge */}
          <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-b from-transparent to-bg" />

          {stars.map((star, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-[#fffdee]"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.base,
                animation: reduced
                  ? undefined
                  : `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
