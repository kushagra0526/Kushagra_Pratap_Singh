import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * Tips a panel towards the cursor in 3D. Subtle on purpose, enough that the
 * page feels alive under the hand, not enough to read as a gimmick.
 */
export default function Tilt({
  children,
  className = "",
  innerClassName = "",
  max = 5,
  scale = 1.01,
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 140, damping: 18, mass: 0.4 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  if (reduced) {
    return (
      <div className={className}>
        <div className={innerClassName}>{children}</div>
      </div>
    );
  }

  const handleMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div ref={ref} className={className} style={{ perspective: 1100 }}>
      <motion.div
        className={innerClassName}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        whileHover={{ scale }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
