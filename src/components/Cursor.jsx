import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import useMediaQuery from "../hooks/useMediaQuery";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * Two-part cursor: a dot that tracks the pointer exactly, and a ring that
 * trails it on a spring. Both sit in `mix-blend-mode: difference`, so they
 * invert whatever is underneath instead of needing a colour of their own.
 *
 * Mouse users only, never on touch, never under reduced motion, and the
 * native cursor is only hidden while this is actually running.
 */
export default function Cursor() {
  const fine = useMediaQuery("(pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const active = fine && !reduced;

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.4 });

  const [label, setLabel] = useState("");
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  // A label pushed from outside, for things that are drawn rather than laid
  // out: the hero sphere sits under the copy, so pointerover never reaches it
  // and it has to say for itself when the pointer is over it.
  const [hint, setHint] = useState(null);

  useEffect(() => {
    if (!active) return undefined;

    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const onOver = (event) => {
      const target = event.target.closest?.("[data-cursor], a, button, input, textarea");
      if (!target) {
        setHovering(false);
        setLabel("");
        return;
      }
      setHovering(true);
      setLabel(target.getAttribute("data-cursor") || "");
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onHint = (event) => setHint(event.detail || null);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("cursor-hint", onHint);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("cursor-hint", onHint);
    };
  }, [active, x, y]);

  if (!active) return null;

  const shown = hint || label;
  const ringSize = shown ? 68 : hovering ? 46 : 28;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[999] mix-blend-difference">
      <motion.span
        className="absolute top-0 left-0 block rounded-full bg-[#fffdee]"
        style={{ x, y, translateX: "-50%", translateY: "-50%", width: 5, height: 5 }}
        animate={{ opacity: shown ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />

      <motion.span
        className="absolute top-0 left-0 grid place-items-center rounded-full border border-[#fffdee]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: ringSize,
          height: ringSize,
          backgroundColor: shown ? "rgba(255,253,238,1)" : "rgba(255,253,238,0)",
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.5 }}
      >
        <AnimatePresence>
          {shown ? (
            <motion.span
              key={shown}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="font-mono text-[0.6rem] tracking-[0.08em] text-[#0a0e16] uppercase"
            >
              {shown}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
    </div>
  );
}
