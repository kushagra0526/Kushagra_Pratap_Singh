import React from "react";
import MaskText from "./MaskText";
import Reveal from "./Reveal";

export default function SectionHeading({ index, title, note }) {
  return (
    <header className="grid gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
      <div>
        <Reveal>
          <p
            aria-hidden="true"
            className="font-mono text-[0.7rem] tracking-[0.16em] text-gold uppercase"
          >
            {index} <span className="text-dim">/</span> {title}
          </p>
        </Reveal>

        <h2 className="mt-5 font-display text-[clamp(2.6rem,8.5vw,7rem)] leading-[0.88] font-medium tracking-[-0.035em] text-fg uppercase">
          <MaskText>{title}</MaskText>
        </h2>
      </div>

      {note ? (
        <Reveal delay={0.1}>
          <p className="max-w-[34ch] text-[1rem] leading-relaxed text-muted md:pb-2 md:text-right">
            {note}
          </p>
        </Reveal>
      ) : null}
    </header>
  );
}
