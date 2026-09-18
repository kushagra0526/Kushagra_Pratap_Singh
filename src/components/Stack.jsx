import React from "react";
import BrandIcon from "./BrandIcon";
import { brandColor } from "../lib/brandIcons";
import Glow from "./Glow";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import { stack } from "../data/content";

function StackItem({ item }) {
  const color = item.icon ? brandColor(item.icon) : null;

  return (
    <li
      className="group flex items-center gap-2.5 rounded-lg border border-line bg-bg/40 px-3 py-2.5 transition-colors duration-300 hover:border-linestrong"
      style={color ? { "--brand": color } : undefined}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center text-muted transition-colors duration-300">
        {item.icon ? (
          <BrandIcon
            name={item.icon}
            className={`h-[17px] w-[17px] transition-colors duration-300 ${
              color ? "group-hover:text-[var(--brand)]" : "group-hover:text-fg"
            }`}
          />
        ) : (
          <span className="font-mono text-[0.58rem] text-dim transition-colors duration-300 group-hover:text-gold">
            {item.short}
          </span>
        )}
      </span>
      <span className="truncate text-[0.86rem] text-fg/90">{item.name}</span>
    </li>
  );
}

export default function Stack() {
  const total = stack.reduce((count, group) => count + group.items.length, 0);

  return (
    <section id="stack" className="relative scroll-mt-20 overflow-hidden py-24 md:py-36">
      <Glow color="125,155,214" className="bottom-[6%] left-[-8%] h-[22rem] w-[22rem]" drift="drift-b" />

      <div className="relative mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="04"
          title="Stack"
          count={total}
          note="What I reach for, grouped by where it sits in a system."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {stack.map((group, index) => (
            <Reveal key={group.group} delay={(index % 3) * 0.06}>
              <Tilt max={5} className="h-full" innerClassName="h-full">
                <div className="surface h-full rounded-2xl p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[1.2rem] text-fg">{group.group}</h3>
                    <span className="font-mono text-[0.68rem] text-dim">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">{group.note}</p>

                  <ul className="mt-6 grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <StackItem key={item.name} item={item} />
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
