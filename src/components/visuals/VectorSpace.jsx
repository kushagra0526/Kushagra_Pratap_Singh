import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useRevealed from "../../hooks/useRevealed";
import VisualFrame from "./VisualFrame";

const QUERY = { x: 300, y: 148 };

// Three neighbours, placed by hand so the diagram reads clearly.
const NEIGHBOURS = [
  { id: "a", x: 238, y: 112 },
  { id: "b", x: 360, y: 124 },
  { id: "c", x: 326, y: 204 },
];

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

function useCloud(count = 60) {
  return useMemo(() => {
    const random = mulberry32(1536);
    const points = [];
    while (points.length < count) {
      const x = 26 + random() * 568;
      const y = 22 + random() * 248;
      const dx = x - QUERY.x;
      const dy = y - QUERY.y;
      if (Math.sqrt(dx * dx + dy * dy) < 86) continue; // keep the neighbourhood clear
      points.push({ x, y, r: random() < 0.82 ? 2 : 2.8, o: 0.14 + random() * 0.24 });
    }
    return points;
  }, [count]);
}

export default function VectorSpace() {
  const cloud = useCloud();
  const ref = useRef(null);
  const inView = useRevealed(ref, "-15% 0px");
  const reduced = usePrefersReducedMotion();
  const show = reduced || inView;

  return (
    <VisualFrame caption="a 2-D stand-in for a 1536-dimension index. Nearest neighbours decide the estimate">
      <div ref={ref}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" /> new task
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[rgba(255,253,238,0.3)]" aria-hidden="true" />
            past tasks
          </span>
          <span className="ml-auto font-mono text-[0.7rem] text-dim">pgvector · HNSW</span>
        </div>

        <svg
          viewBox="0 0 620 292"
          className="mt-4 h-auto w-full"
          role="img"
          aria-label="A cloud of past task embeddings, with the three nearest to a new task highlighted"
        >
          {cloud.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={point.r}
              fill={`rgba(255,253,238,${point.o})`}
            />
          ))}

          <circle
            cx={QUERY.x}
            cy={QUERY.y}
            r="78"
            fill="none"
            stroke="rgba(237,179,88,0.22)"
            strokeDasharray="4 6"
          />

          {NEIGHBOURS.map((neighbour, index) => (
            <g key={neighbour.id}>
              <motion.line
                x1={QUERY.x}
                y1={QUERY.y}
                x2={neighbour.x}
                y2={neighbour.y}
                stroke="rgba(237,179,88,0.5)"
                strokeWidth="1"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={show ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: reduced ? 0 : 0.3 + index * 0.16 }}
              />
              <motion.circle
                cx={neighbour.x}
                cy={neighbour.y}
                r="5"
                fill="#edb358"
                initial={reduced ? false : { scale: 0, opacity: 0 }}
                animate={show ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.35, delay: reduced ? 0 : 0.45 + index * 0.16 }}
                style={{ transformOrigin: `${neighbour.x}px ${neighbour.y}px` }}
              />
            </g>
          ))}

          <circle cx={QUERY.x} cy={QUERY.y} r="8" fill="#08101b" stroke="#edb358" strokeWidth="2" />
          <circle cx={QUERY.x} cy={QUERY.y} r="3" fill="#edb358" />
        </svg>

        <p className="mt-5 max-w-[64ch] text-[0.92rem] leading-relaxed text-muted">
          Gemini turns what you typed into structured fields; the embedding of those fields is
          matched against everything logged before. How long those similar tasks actually took
          becomes the estimate.
        </p>
      </div>
    </VisualFrame>
  );
}
