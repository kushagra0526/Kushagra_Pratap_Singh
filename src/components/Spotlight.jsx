import React, { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * A soft warm glow that follows the cursor, well behind the copy. It's the
 * one place the page visibly notices you — cheap enough to leave running for
 * the whole session, since it's a single CSS custom-property write per
 * pointer move rather than a render loop.
 */
export default function Spotlight() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;

    const apply = () => {
      node.style.setProperty("--sx", `${x}px`);
      node.style.setProperty("--sy", `${y}px`);
    };
    apply();

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      node.style.opacity = "1";
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      node.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(560px circle at var(--sx, 50%) var(--sy, 33%), rgba(237,179,88,0.07), transparent 62%)",
      }}
    />
  );
}
