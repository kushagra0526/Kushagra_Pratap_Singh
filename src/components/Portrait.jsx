import React from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const RING_TEXT = "FULLSTACK ENGINEER · OPEN TO WORK · ";

/**
 * The portrait slot. There's no photo of Kushagra to put here yet, so this is
 * a monogram card built to look like a deliberate design choice rather than a
 * broken image: a gradient field, a faceted card edge, and a rotating badge
 * text ring, matching the "now playing" ring the reference site uses around
 * its own portrait.
 *
 * To swap in a real photo: drop it at `public/portrait.jpg` and replace the
 * monogram block below with an <img src="/portrait.jpg" />, same aspect box.
 */
export default function Portrait() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 0%, rgba(237,179,88,0.32), transparent 55%), radial-gradient(110% 90% at 100% 100%, rgba(125,155,214,0.3), transparent 55%), #101a27",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,253,238,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,253,238,0.08) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[7.5rem] leading-none text-transparent uppercase [-webkit-text-stroke:1.5px_rgba(255,253,238,0.5)]">
            KPS
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between font-mono text-[0.62rem] text-dim">
          <span>JAIPUR, IN</span>
          <span className="flex items-center gap-1.5 text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
            AVAILABLE 2027
          </span>
        </div>
      </div>

      {/* the rotating badge, hanging off the top-right corner like a seal */}
      <div
        aria-hidden="true"
        className="absolute -top-6 -right-6 hidden h-24 w-24 place-items-center rounded-full border border-line bg-surface/80 backdrop-blur sm:grid"
        style={{
          animation: reduced ? undefined : "spin-slow 16s linear infinite",
          transformOrigin: "50% 50%",
        }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <path id="portrait-ring-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-gold font-mono" style={{ fontSize: "8.4px", letterSpacing: "0.05em" }}>
            <textPath href="#portrait-ring-path" startOffset="0%">
              {RING_TEXT.repeat(2)}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
