import React from "react";
import { ICONS } from "../lib/brandIcons";

export default function BrandIcon({ name, className = "" }) {
  // LinkedIn isn't in simple-icons (removed at the brand's request), so it gets
  // a plain lettermark rather than a copied logo.
  if (name === "linkedin") {
    return (
      <span
        aria-hidden="true"
        className={`grid place-items-center font-sans text-[0.85rem] leading-none font-bold ${className}`}
      >
        in
      </span>
    );
  }

  const icon = ICONS[name];
  if (!icon) return null;

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={icon.path} />
    </svg>
  );
}
