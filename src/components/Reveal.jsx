import React, { useRef } from "react";
import { motion } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import useRevealed from "../hooks/useRevealed";

/**
 * The page's one reveal: a short rise and fade as an element arrives. Anything
 * the reader scrolls straight past is shown immediately rather than left blank
 * (see useRevealed).
 */
export default function Reveal({ children, delay = 0, y = 20, className }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const revealed = useRevealed(ref, "-8% 0px -8% 0px");

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
