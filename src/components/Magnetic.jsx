import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * Pulls an element a little towards the cursor while it's hovered, then lets
 * it spring back. Used on the two buttons that matter.
 */
export default function Magnetic({ children, strength = 0.28, className = "" }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 16, mass: 0.35 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  if (reduced) return <span className={className}>{children}</span>;

  const handleMove = (event) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
