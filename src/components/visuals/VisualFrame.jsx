import React from "react";

/** Shared frame for the diagrams, so they read as one family. */
export default function VisualFrame({ caption, children, className = "", padded = true }) {
  return (
    <figure
      className={`surface relative isolate overflow-hidden rounded-2xl ${
        padded ? "p-5 sm:p-7" : ""
      } ${className}`}
    >
      {children}
      {caption ? (
        <figcaption
          className={`font-mono text-[0.62rem] text-dim ${padded ? "mt-5" : "px-5 pb-4"}`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
