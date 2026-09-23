import React from "react";
import Glow from "./Glow";
import MaskText from "./MaskText";
import Portrait from "./Portrait";
import Reveal from "./Reveal";
import ScrollText from "./ScrollText";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import { motto, overview } from "../data/content";

function Glyph({ kind }) {
  const props = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (kind === "server") {
    return (
      <svg {...props}>
        <rect x="3.5" y="4" width="17" height="6" rx="1.5" />
        <rect x="3.5" y="14" width="17" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
      </svg>
    );
  }

  if (kind === "layout") {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 9v11" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />
      <path d="M18.8 15.8c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2Z" />
    </svg>
  );
}

export default function Overview() {
  return (
    <section id="overview" className="relative scroll-mt-20 overflow-hidden py-24 md:py-36">
      <Glow color="237,179,88" className="top-[10%] right-[-8%] h-[26rem] w-[26rem]" drift="drift-a" />

      <div className="relative mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading index="01" title="Overview" note={overview.note} />

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-16">
          <div className="min-w-0">
            <ScrollText
              text={overview.statement}
              className="font-display text-[clamp(1.45rem,2.6vw,2.2rem)] leading-[1.3] tracking-[-0.01em] text-fg"
            />

            <div className="mt-10 flex flex-col gap-5 text-[1.02rem] leading-[1.7] text-muted">
              {overview.paragraphs.map((paragraph) => (
                <Reveal key={paragraph.slice(0, 28)}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <dl className="surface mt-10 divide-y divide-line overflow-hidden rounded-2xl">
                {overview.facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-6 px-6 py-4">
                    <dt className="font-mono text-[0.68rem] tracking-[0.1em] text-dim uppercase">
                      {fact.label}
                    </dt>
                    <dd className="text-right text-[0.95rem] text-fg">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <Tilt max={4} scale={1.005}>
              <Portrait />
            </Tilt>
          </Reveal>
        </div>

        {/* The motto: the turn from who I am (above) to what I do (below).
            Each line lands in turn, in the solid / gold / outlined rhythm the
            rest of the display type uses. */}
        <figure className="mt-24 border-y border-line py-14 md:mt-32 md:py-20">
          <blockquote className="font-display text-[clamp(2rem,6.2vw,5.2rem)] leading-[0.98] font-medium tracking-[-0.035em] uppercase">
            {motto.map((line, index) => (
              <span key={line} className="block">
                <MaskText
                  delay={index * 0.12}
                  className={
                    index === 1
                      ? "text-gold"
                      : index === 2
                        ? "text-transparent [-webkit-text-stroke:1.2px_rgba(255,253,238,0.6)]"
                        : "text-fg"
                  }
                >
                  {line}
                </MaskText>
              </span>
            ))}
          </blockquote>
          <figcaption className="mt-8 font-mono text-[0.68rem] tracking-[0.16em] text-dim uppercase">
            — The motto I work by
          </figcaption>
        </figure>

        <div className="mt-20">
          <Reveal>
            <p className="font-mono text-[0.68rem] tracking-[0.16em] text-dim uppercase">
              What I do
            </p>
          </Reveal>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {overview.pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.08}>
                <Tilt max={6} className="h-full" innerClassName="h-full">
                  <article className="surface surface-hover group relative h-full overflow-hidden rounded-2xl p-7">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
                    />
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[0.7rem] text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-muted transition-colors duration-300 group-hover:text-gold">
                        <Glyph kind={pillar.icon} />
                      </span>
                    </div>

                    <h3 className="mt-12 font-display text-[1.45rem] leading-tight text-fg">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-[0.97rem] leading-relaxed text-muted">{pillar.body}</p>

                    <ul className="mt-6 flex flex-wrap gap-1.5">
                      {pillar.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.65rem] text-muted"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
