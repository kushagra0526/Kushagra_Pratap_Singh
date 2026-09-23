"use client";

import React, { useEffect, useMemo, useState } from "react";
import VaporizeTextCycle, { Tag } from "./vapour-text-effect";

// How long the name holds before it starts dissolving, and how long the
// overlay itself takes to fade out once it does. Keep FADE_OUT_MS in sync
// with the `duration-500` class below. The hold is just long enough for the
// name to finish arriving and begin to vaporise; anything past that is
// someone waiting to read the page.
const DISSOLVE_AT_MS = 1700;
const FADE_OUT_MS = 500;

// The canvas draws at a fixed pixel size, so a phone would clip "Kushagra's
// Portfolio" at the spec's 56px. Scale it to the viewport instead; ~11px of
// width per 1px of font size is what this string measures in Space Grotesk.
const MAX_FONT_SIZE = 56;
const MIN_FONT_SIZE = 22;

function fitFontSize(width) {
  return Math.round(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, width / 11)));
}

export default function LoadingScreen({ onFinish }) {
  const [leaving, setLeaving] = useState(false);
  const [charging, setCharging] = useState(false);
  const [fontSize, setFontSize] = useState(() =>
    fitFontSize(typeof window === "undefined" ? 640 : window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setFontSize(fitFontSize(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const leave = () => setLeaving(true);
    const dissolveTimer = setTimeout(leave, DISSOLVE_AT_MS);
    // Kick the progress rule on the next frame so the transition actually runs.
    const chargeFrame = requestAnimationFrame(() => setCharging(true));

    // Any sign of intent skips it. Someone who has started clicking, typing
    // or scrolling has told us they want the page, not the intro.
    const skipEvents = ["pointerdown", "keydown", "wheel", "touchstart"];
    skipEvents.forEach((type) => window.addEventListener(type, leave, { passive: true }));

    return () => {
      clearTimeout(dissolveTimer);
      cancelAnimationFrame(chargeFrame);
      skipEvents.forEach((type) => window.removeEventListener(type, leave));
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const unmountTimer = setTimeout(onFinish, FADE_OUT_MS);
    return () => clearTimeout(unmountTimer);
  }, [leaving, onFinish]);

  const font = useMemo(
    () => ({
      fontFamily: "'Clash Display', 'Space Grotesk', sans-serif",
      fontSize: `${fontSize}px`,
      fontWeight: 500,
    }),
    [fontSize]
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Same night sky the page itself sits on, so the fade-out lands on a
          continuous scene rather than cutting from black. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#16213a_0%,#0b1524_45%,#0a0e16_100%)]" />
      <div
        className="absolute -top-[22vh] left-1/2 h-[72vh] w-[90vw] max-w-[1100px] -translate-x-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, rgba(88,104,196,0.34), rgba(88,104,196,0.08) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-[42vh] left-1/2 h-[40vh] w-[70vw] max-w-[760px] -translate-x-1/2 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, rgba(237,179,88,0.2), transparent 70%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <VaporizeTextCycle
          texts={["Kushagra's Portfolio"]}
          font={font}
          color="rgb(255, 253, 238)"
          spread={4}
          density={6}
          animation={{
            vaporizeDuration: 1.4,
            fadeInDuration: 0.9,
            waitDuration: 0.3,
          }}
          direction="left-to-right"
          alignment="center"
          tag={Tag.H1}
        />
      </div>

      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-4 px-6">
        <div className="h-px w-40 overflow-hidden bg-white/12">
          <div
            className="h-full bg-gradient-to-r from-[#d9963f] to-[#edb358]"
            style={{
              width: charging ? "100%" : "0%",
              transition: `width ${DISSOLVE_AT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        </div>
        <p className="font-mono text-[0.6rem] tracking-[0.18em] text-[rgba(255,253,238,0.42)] uppercase">
          fullstack engineer · lnmiit '27
        </p>
      </div>
    </div>
  );
}
