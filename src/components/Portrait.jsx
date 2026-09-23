import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { createSoundtrack } from "../lib/soundtrack";

const RING_TEXT = "FULLSTACK ENGINEER · OPEN TO WORK · ";
const PLAYING_TEXT = "NOW PLAYING · CLICK TO STOP · ";

function PlayGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="ml-0.5 h-3.5 w-3.5" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  );
}

/** Four bars bouncing out of step — the universal "this is playing" sign. */
function Equalizer({ reduced }) {
  if (reduced) {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
      {[0.9, 0.7, 1.1, 0.8].map((duration, index) => (
        <span
          key={index}
          className="h-full w-[3px] origin-bottom rounded-full bg-current"
          style={{ animation: `eq ${duration}s ease-in-out ${index * 0.12}s infinite` }}
        />
      ))}
    </span>
  );
}

/**
 * The portrait card: the photo at `public/portrait.jpg`, cropped to a 4:5 box,
 * with a rotating badge text ring that doubles as a play/stop button for the
 * soundtrack (see lib/soundtrack.js — drop an mp3 at public/song.mp3 to use a
 * real track).
 */
export default function Portrait() {
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const soundtrack = useRef(null);

  useEffect(() => {
    soundtrack.current = createSoundtrack();
    // Find out now whether a real track exists, so the click can start sound
    // straight away instead of waiting on a request first.
    soundtrack.current.prepare();
    return () => soundtrack.current?.stop();
  }, []);

  const toggle = () => {
    if (!soundtrack.current) return;
    if (playing) soundtrack.current.stop();
    else soundtrack.current.start();
    setPlaying(!playing);
  };

  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line">
        <img
          src="/portrait.jpg"
          alt="Kushagra Pratap Singh standing in front of a waterfall"
          width={844}
          height={1500}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_62%]"
        />
        {/* Darkens the bottom edge so the labels stay legible over the photo. */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1320]/90 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between font-mono text-[0.62rem] text-fg/80">
          <span>JAIPUR, IN</span>
          <span className="flex items-center gap-1.5 text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
            AVAILABLE 2027
          </span>
        </div>
      </div>

      {/* The rotating badge, hanging off the top-right corner like a seal —
          and a play/stop button. Only the ring text turns; the button and its
          icon stay put, so the thing you are clicking never moves under you.
          The spin rate is the same playing or not: changing an animation's
          duration mid-turn makes it jump to a new angle. */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Stop music" : "Play music"}
        data-cursor={playing ? "stop" : "play"}
        className={`group absolute -top-6 -right-6 hidden h-24 w-24 place-items-center rounded-full border bg-surface/80 backdrop-blur transition-[border-color,box-shadow] duration-500 sm:grid ${
          playing
            ? "border-gold/60 shadow-[0_0_32px_-6px_rgba(237,179,88,0.55)]"
            : "border-line hover:border-gold/50"
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          style={{
            animation: reduced ? undefined : "spin-slow 16s linear infinite",
            transformOrigin: "50% 50%",
          }}
        >
          <defs>
            <path id="portrait-ring-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-gold font-mono" style={{ fontSize: "8.4px", letterSpacing: "0.05em" }}>
            <textPath href="#portrait-ring-path" startOffset="0%">
              {(playing ? PLAYING_TEXT : RING_TEXT).repeat(2)}
            </textPath>
          </text>
        </svg>

        <span
          className={`relative grid h-9 w-9 place-items-center rounded-full text-gold transition-colors duration-300 ${
            playing ? "bg-gold/15" : "bg-gold/8 group-hover:bg-gold/15"
          }`}
        >
          {playing ? <Equalizer reduced={reduced} /> : <PlayGlyph />}
        </span>
      </button>
    </div>
  );
}
