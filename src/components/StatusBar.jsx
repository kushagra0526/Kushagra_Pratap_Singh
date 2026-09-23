import React, { useEffect, useState } from "react";
import useActiveSection from "../hooks/useActiveSection";
import { navItems, profile } from "../data/content";

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");

const SECTION_IDS = navItems.map((item) => item.id);
const LABELS = Object.fromEntries(navItems.map((item) => [item.id, item.label]));

function useScrollPercent() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPercent(max > 0 ? Math.round(Math.min(1, Math.max(0, window.scrollY / max)) * 100) : 0);
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
  }, []);

  return percent;
}

function useLocalTime(timeZone) {
  const read = () =>
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" }).format(
      new Date()
    );
  const [time, setTime] = useState(read);

  useEffect(() => {
    const id = setInterval(() => setTime(read()), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);

  return time;
}

/**
 * The readout strip. It runs on the same 1240px column as everything else, so
 * the page reads as one instrument rather than a document with a bar stuck to
 * it. Desktop only — on a phone it would cost a row of screen to say what the
 * page already says.
 */
export default function StatusBar() {
  const active = useActiveSection(SECTION_IDS);
  const percent = useScrollPercent();
  const time = useLocalTime(profile.timeZone);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden border-t border-line bg-bg/70 backdrop-blur-xl md:block"
      aria-hidden="true"
    >
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between px-6 font-mono text-[0.64rem] tracking-[0.1em] text-dim uppercase md:px-10">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-mint"
                style={{ animation: "ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            Available 2027
          </span>

          <span className="text-line">/</span>

          <span>
            <span className="text-dim">sec</span>{" "}
            <span className="text-gold">{active ? LABELS[active] || active : "Top"}</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="tabular-nums">
            {String(percent).padStart(2, "0")}
            <span className="text-line">%</span>
          </span>

          <span className="text-line">/</span>

          <span className="tabular-nums">{time} IST</span>

          <span className="text-line">/</span>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            className="pointer-events-auto flex items-center gap-2 tracking-[0.1em] text-dim transition-colors duration-300 hover:text-fg"
          >
            <span aria-hidden="true" className="text-gold">✦</span>
            Explore
            <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.6rem] text-dim">
              {IS_MAC ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
