import React from "react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import { education, highlights } from "../data/content";

export default function Highlights() {
  return (
    <section id="highlights" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="05"
          title="Highlights"
          count={highlights.length}
          note="Competitive programming, a workshop, a hackathon, and a design team."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <Tilt max={6} className="h-full" innerClassName="h-full">
                <article className="surface surface-hover flex h-full flex-col rounded-2xl p-6">
                  <p className="font-mono text-[0.66rem] tracking-[0.14em] text-gold uppercase">
                    {item.kicker}
                  </p>

                  <p
                    className={`mt-10 font-display leading-none text-fg ${
                      item.value.length > 8
                        ? "text-[clamp(1.5rem,2.4vw,1.9rem)]"
                        : "text-[clamp(2.1rem,3.6vw,2.9rem)]"
                    }`}
                  >
                    {item.value}
                  </p>

                  <h3 className="mt-3 text-[1rem] text-fg">{item.title}</h3>
                  <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-muted">{item.body}</p>

                  {item.links ? (
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                      {item.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline font-mono text-[0.68rem] text-muted transition-colors hover:text-gold"
                        >
                          {link.label} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              </Tilt>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16">
            <p className="font-mono text-[0.68rem] tracking-[0.16em] text-dim uppercase">
              Education
            </p>
            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
              {education.map((entry) => (
                <div key={entry.school} className="bg-surface p-6 md:p-8">
                  <p className="font-mono text-[0.68rem] text-gold">{entry.period}</p>
                  <h3 className="mt-3 font-display text-[1.25rem] leading-tight text-fg">
                    {entry.school}
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-muted">{entry.detail}</p>
                  {entry.place ? (
                    <p className="mt-1 text-[0.85rem] text-dim">{entry.place}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
