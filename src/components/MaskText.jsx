import React, { useRef } from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import useRevealed from "../hooks/useRevealed";

/** Slides a line of display type up from under a clipped edge when it arrives. */
export default function MaskText({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const shown = useRevealed(ref, "0px 0px -6% 0px");

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <span
      ref={ref}
      className={`inline-block overflow-hidden pt-[0.1em] pb-[0.04em] align-bottom ${className}`}
    >
      <motion.span
        className="inline-block"
        initial={{ y: "108%" }}
        animate={shown ? { y: "0%" } : { y: "108%" }}
        transition={{ duration: 0.95, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
