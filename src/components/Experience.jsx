import React from "react";
import CountUp from "./CountUp";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import RbacDiagram from "./visuals/RbacDiagram";
import { experience } from "../data/content";

export default function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="02"
          title="Experience"
          count={experience.length}
          note="Where I've shipped to real users, with real money moving through it."
        />

        {experience.map((role) => (
          <article key={role.id} className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-raised font-display text-[1.05rem] text-gold">
                    {role.monogram}
                  </span>
                  <div>
                    <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight text-fg">
                      {role.company}
                    </h3>
                    <p className="mt-1 text-[0.95rem] text-muted">
                      {role.title} · {role.location}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <p className="mt-5 font-mono text-[0.74rem] tracking-[0.1em] text-gold">
                  {role.period}
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="mt-6 max-w-[52ch] text-[1.06rem] leading-[1.7] text-fg">
                  {role.summary}
                </p>
              </Reveal>

              <ul className="mt-8 space-y-4">
                {role.bullets.map((bullet, index) => (
                  <Reveal key={bullet.slice(0, 28)} delay={0.05 + index * 0.05}>
                    <li className="flex gap-4 text-[1rem] leading-[1.65] text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {bullet}
                    </li>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={0.1}>
                <ul className="mt-8 flex flex-wrap gap-1.5">
                  {role.stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line px-3 py-1 font-mono text-[0.66rem] text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="flex flex-col gap-4">
              <Reveal>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {role.metrics.map((metric) => (
                    <div key={metric.label} className="surface flex flex-col-reverse rounded-xl p-4">
                      <dt className="mt-2 text-[0.75rem] leading-snug text-dim">{metric.label}</dt>
                      <dd className="font-display text-[clamp(1.35rem,2.2vw,1.8rem)] leading-none text-fg">
                        <CountUp
                          to={metric.value}
                          decimals={metric.decimals || 0}
                          prefix={metric.prefix || ""}
                          suffix={metric.suffix || ""}
                          comma={metric.comma}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={0.1}>
                <Tilt max={4} scale={1}>
                  <RbacDiagram />
                </Tilt>
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
