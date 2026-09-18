import React, { useRef } from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useRevealed from "../../hooks/useRevealed";
import VisualFrame from "./VisualFrame";

const SITE_A = [
  { char: "h", id: "A1" },
  { char: "e", id: "A2" },
  { char: "l", id: "A3" },
];

const SITE_B = [
  { char: "l", id: "B1" },
  { char: "o", id: "B2" },
  { char: "!", id: "B3" },
];

const MERGED = [...SITE_A, ...SITE_B];

function Chip({ char, id, tone, className = "", style }) {
  return (
    <span
      className={`flex flex-col items-center rounded-lg px-2.5 py-1.5 ring-1 ${
        tone === "a"
          ? "bg-sky/12 ring-sky/35"
          : tone === "b"
            ? "bg-mint/12 ring-mint/35"
            : "bg-gold/12 ring-gold/40"
      } ${className}`}
      style={style}
    >
      <span className="font-mono text-sm leading-none text-fg">{char === " " ? "␣" : char}</span>
      <span
        className={`mt-1 font-mono text-[0.5rem] leading-none ${
          tone === "a" ? "text-sky" : tone === "b" ? "text-mint" : "text-gold"
        }`}
      >
        {id}
      </span>
    </span>
  );
}

function Lane({ title, ops, tone, show, reduced, baseDelay }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.022] p-3">
      <p className="font-mono text-[0.58rem] tracking-[0.08em] text-dim uppercase">{title}</p>
      <div className="mt-3 flex items-center gap-1.5">
        {ops.map((op, index) => (
          <motion.div
            key={op.id}
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={show ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.28, delay: reduced ? 0 : baseDelay + index * 0.13 }}
          >
            <Chip char={op.char} id={op.id} tone={tone} />
          </motion.div>
        ))}
        <span
          className={`ml-1 h-6 w-px ${tone === "a" ? "bg-sky" : "bg-mint"}`}
          style={{ animation: reduced ? undefined : "pulse-dot 1.2s steps(2) infinite" }}
        />
      </div>
    </div>
  );
}

export default function CrdtMerge() {
  const ref = useRef(null);
  const inView = useRevealed(ref, "-15% 0px");
  const reduced = usePrefersReducedMotion();
  const show = reduced || inView;

  return (
    <VisualFrame caption="illustrative: RGA identifiers give every character a stable, total order">
      <div ref={ref}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Lane
            title="site a · offline"
            ops={SITE_A}
            tone="a"
            show={show}
            reduced={reduced}
            baseDelay={0.15}
          />
          <Lane
            title="site b · offline"
            ops={SITE_B}
            tone="b"
            show={show}
            reduced={reduced}
            baseDelay={0.3}
          />
        </div>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[0.58rem] text-dim">
            reconnect → merge by identifier
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="rounded-xl border border-gold/25 bg-gold/[0.045] p-3">
          <p className="font-mono text-[0.58rem] tracking-[0.08em] text-gold uppercase">
            both sites, converged
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {MERGED.map((op, index) => (
              <motion.div
                key={op.id}
                initial={reduced ? false : { opacity: 0, y: -14, scale: 0.8 }}
                animate={show ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.32, delay: reduced ? 0 : 0.85 + index * 0.1 }}
              >
                <Chip char={op.char} id={op.id} tone="merged" />
              </motion.div>
            ))}
            <motion.span
              initial={reduced ? false : { opacity: 0 }}
              animate={show ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: reduced ? 0 : 1.55 }}
              className="ml-2 font-mono text-[0.62rem] text-muted"
            >
              same sequence, no coordinator
            </motion.span>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}
