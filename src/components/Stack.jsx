import React from "react";
import BrandIcon from "./BrandIcon";
import { brandColor } from "../lib/brandIcons";
import Glow from "./Glow";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import { stack } from "../data/content";

// Logos carry the section: each group is a card of logo tiles, with just the
// name under each, so it scans in seconds instead of being read.
function Tile({ item }) {
  // Near-black brand colours (Express, Kafka, Prisma) would vanish on navy,
  // so those fall back to cream.
  const color = item.icon ? (brandColor(item.icon) ?? "var(--c-fg)") : null;

  return (
    <li className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-line bg-bg/40 px-1.5 py-4 text-center transition-colors duration-300 hover:border-linestrong hover:bg-bg/70">
      <span className="grid h-9 place-items-center transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
        {item.icon ? (
          <span style={{ color }}>
            <BrandIcon name={item.icon} className="h-8 w-8" />
          </span>
        ) : (
          <span className="font-mono text-[1.05rem] font-semibold tracking-tight text-gold">
            {item.short}
          </span>
        )}
      </span>
      <span className="text-[0.74rem] leading-tight text-muted transition-colors duration-300 group-hover:text-fg">
        {item.name}
      </span>
    </li>
  );
}

export default function Stack() {
  return (
    <section id="stack" className="relative scroll-mt-20 overflow-hidden py-24 md:py-36">
      <Glow color="125,155,214" className="bottom-[6%] left-[-8%] h-[22rem] w-[22rem]" drift="drift-b" />

      <div className="relative mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading index="04" title="Stack" note="The tools I build with." />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {stack.map((group, index) => (
            <Reveal key={group.group} delay={(index % 3) * 0.06}>
              <Tilt max={5} className="h-full" innerClassName="h-full">
                <div className="surface h-full rounded-2xl p-5">
                  <div className="flex items-baseline justify-between gap-4 px-1">
                    <h3 className="font-display text-[1.15rem] text-fg">{group.group}</h3>
                    <span className="font-mono text-[0.68rem] text-dim">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </div>

                  <ul className="mt-4 grid grid-cols-3 gap-2">
                    {group.items.map((item) => (
                      <Tile key={item.name} item={item} />
                    ))}
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
