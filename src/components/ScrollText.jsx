import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

function Word({ word, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <motion.span style={{ opacity }}>
      {word}{" "}
    </motion.span>
  );
}

/**
 * A paragraph that fills in word by word as it moves up the screen. Progress
 * is measured by hand rather than with framer's `useScroll({ target })`, so it
 * stays in step with the smooth-scroll layer and survives jumps.
 */
export default function ScrollText({ text, className = "" }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const progress = useMotionValue(0);

  useEffect(() => {
    if (reduced) return undefined;
    let frame = 0;

    const update = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const startLine = window.innerHeight * 0.85;
      const endLine = window.innerHeight * 0.4;
      const distance = rect.height + startLine - endLine;
      const value = (startLine - rect.top) / distance;
      progress.set(Math.min(1, Math.max(0, value)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progress, reduced]);

  if (reduced) return <p className={className}>{text}</p>;

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          word={word}
          progress={progress}
          start={index / words.length}
          end={(index + 1) / words.length}
        />
      ))}
    </p>
  );
}
