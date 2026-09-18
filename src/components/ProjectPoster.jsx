import React from "react";
import { VISUALS } from "./visuals";
import { PROJECT_TINTS } from "../lib/projectTints";

/**
 * The big cover art for a project: a designed poster rather than a
 * screenshot, since none of the three live deployments currently render
 * anything worth capturing (one's behind sign-in, one opens an empty room,
 * one's backend is cold). The real technical diagram still appears, as a
 * proof card inset into the composition, so the claims stay honest.
 */
export default function ProjectPoster({ project, size = "lg" }) {
  const tint = PROJECT_TINTS[project.id] || PROJECT_TINTS["later-probably"];
  const Visual = VISUALS[project.visual];
  const large = size === "lg";

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-line ${
        large ? "aspect-[4/3]" : "aspect-[7/5]"
      }`}
      style={{ background: "#0b1220" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 8% 0%, rgba(${tint.rgb},0.4), transparent 55%), radial-gradient(100% 90% at 100% 100%, rgba(${tint.rgb},0.22), transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,253,238,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,253,238,0.1) 1px, transparent 1px)",
          backgroundSize: large ? "32px 32px" : "24px 24px",
        }}
      />

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute font-display leading-none text-transparent select-none ${
          large ? "-top-10 -right-4 text-[13rem]" : "-top-6 -right-3 text-[8rem]"
        }`}
        style={{ WebkitTextStroke: `1px rgba(${tint.rgb},0.35)` }}
      >
        {project.index}
      </span>

      <div className={`relative flex h-full flex-col justify-between ${large ? "p-7" : "p-5"}`}>
        <div>
          <p
            className="font-mono tracking-[0.14em] uppercase"
            style={{ color: tint.hex, fontSize: large ? "0.72rem" : "0.62rem" }}
          >
            {project.category}
          </p>
          <h3
            className={`mt-2 font-display leading-[0.95] tracking-[-0.02em] text-fg ${
              large ? "text-[2.6rem]" : "text-[1.8rem]"
            }`}
          >
            {project.name}
          </h3>
        </div>

        {large && Visual ? (
          <div
            className="max-w-[26rem] rounded-2xl border bg-bg/70 p-4 backdrop-blur-sm"
            style={{ borderColor: `rgba(${tint.rgb},0.3)` }}
          >
            <Visual />
          </div>
        ) : null}
      </div>
    </div>
  );
}
