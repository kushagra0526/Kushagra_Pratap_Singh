import React, { useEffect, useRef, useState } from "react";

import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import useRevealed from "../hooks/useRevealed";

function format(value, decimals, comma) {
  const fixed = value.toFixed(decimals);
  if (!comma) return fixed;
  return Number(fixed).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Counts up to a number once, the first time it comes into view. */
export default function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  comma = false,
  duration = 1.4,
}) {
  const ref = useRef(null);
  const inView = useRevealed(ref, "-15% 0px");
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Reduced motion (and a target of zero) render the final value directly, // see `display` below, so there is nothing to animate.
    if (!inView || reduced || to === 0) return undefined;

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, reduced]);

  const display = reduced || to === 0 ? to : value;

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {format(display, decimals, comma)}
      {suffix}
    </span>
  );
}
