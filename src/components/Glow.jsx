import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * A soft colour field for a section corner: pure CSS, no canvas or WebGL
 * context, so it never fails to load. The blur+animation only runs while the
 * section is actually on screen; scrolled away, it stops outright rather than
 * costing a compositing pass for nothing.
 */
export default function Glow({ color = "237,179,88", className = "", drift = "drift-a" }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "20% 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full mix-blend-screen ${className}`}
      style={{
        background: `radial-gradient(closest-side, rgba(${color},0.5), rgba(${color},0.08) 60%, transparent 100%)`,
        filter: "blur(30px)",
        animation: reduced || !visible ? undefined : `${drift} 30s ease-in-out infinite`,
        animationPlayState: visible ? "running" : "paused",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
