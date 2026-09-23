import React, { useRef } from "react";
import { motion } from "framer-motion";
import BrandIcon from "./BrandIcon";
import CountUp from "./CountUp";
import Magnetic from "./Magnetic";
import SystemGraph from "./SystemGraph";
import useMediaQuery from "../hooks/useMediaQuery";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { scrollToId } from "../hooks/useSmoothScroll";
import { heroStats, links, orbitLinks, profile, socials } from "../data/content";

const EASE = [0.22, 1, 0.36, 1];

function Line({ text, started, delay = 0, outline = false }) {
  const reduced = usePrefersReducedMotion();
  const textClass = outline
    ? "text-transparent [-webkit-text-stroke:1.5px_#fffdee]"
    : "text-fg";

  if (reduced) return <span className={`block ${textClass}`}>{text}</span>;

  return (
    <span className="block overflow-hidden pt-[0.1em] pb-[0.02em]">
      <motion.span
        className={`block ${textClass}`}
        initial={{ y: "106%" }}
        animate={started ? { y: "0%" } : { y: "106%" }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function FadeUp({ children, started, delay = 0, className = "" }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The system itself, rather than a paragraph about it: a mesh with the page's
 * own content lit up on it.
 *
 * Anchored to the section's top-right rather than the copy column, so it can
 * sit up beside the name and run out into the right-hand margin instead of
 * crowding in over the headline. It still passes behind the type where the two
 * meet — the mesh is dim and the display face heavy — and the labels hold
 * themselves back until their node clears the text column.
 */
function HeroGraph({ started, avoidRef }) {
  const reduced = usePrefersReducedMotion();
  const room = useMediaQuery("(min-width: 1024px)");
  if (!room) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-[6.5rem] right-[1.5vw] -z-10 h-[min(38vw,34rem)] w-[min(38vw,34rem)]"
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      animate={started ? { opacity: 0.9, scale: 1 } : { opacity: 0, scale: 0.92 }}
      transition={{ duration: 1.6, delay: 0.55, ease: EASE }}
    >
      <SystemGraph labels={orbitLinks} avoidRef={avoidRef} />
    </motion.div>
  );
}

export default function Hero({ started = true }) {
  const reduced = usePrefersReducedMotion();
  const headlineRef = useRef(null);

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <HeroGraph started={started} avoidRef={headlineRef} />

      {/* md:pb-20 reserves the fixed status bar's height plus a gap. The hero
          is exactly one screen tall, so without it the stats row sat on the
          bottom edge and the bar covered the second line of every label. */}
      <div className="mx-auto flex min-h-[100svh] max-w-[1240px] flex-col px-6 pt-28 pb-8 md:px-10 md:pt-32 md:pb-20">
        <div className="relative flex flex-1 flex-col justify-center">
          <FadeUp started={started} delay={0.05}>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-[0.8rem] text-muted backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-mint"
                  style={{ animation: reduced ? undefined : "ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              {profile.status}
            </p>
          </FadeUp>

          {/* First name solid, surname outlined: the one place on the page
              that borrows a graphic-design move instead of playing it safe. */}
          <h1
            ref={headlineRef}
            className="mt-8 font-display text-[clamp(2.5rem,9.6vw,8rem)] leading-[0.86] font-medium tracking-[-0.04em] uppercase"
          >
            <Line text={profile.firstName} started={started} delay={0.12} />
            <Line text={profile.lastName} started={started} delay={0.22} outline />
          </h1>

          <FadeUp started={started} delay={0.45}>
            <p className="mt-8 font-mono text-[0.74rem] tracking-[0.16em] text-gold uppercase">
              {profile.role}
            </p>
            <p className="mt-4 max-w-[44ch] text-[1.06rem] leading-[1.65] text-muted sm:text-[1.18rem]">
              {profile.intro}
            </p>
          </FadeUp>

          <FadeUp started={started} delay={0.58}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#work"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId("work");
                  }}
                  className="group inline-flex items-center gap-3 rounded-full bg-fg py-2.5 pr-2.5 pl-6 text-[0.92rem] font-medium text-bg transition-colors duration-300 hover:bg-gold"
                >
                  View selected work
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full bg-bg text-fg transition-transform duration-500 group-hover:-rotate-45"
                  >
                    →
                  </span>
                </a>
              </Magnetic>

              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer"
                className="surface surface-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[0.92rem] text-fg"
              >
                Résumé <span aria-hidden="true" className="text-gold">↗</span>
              </a>
            </div>
          </FadeUp>

          <FadeUp started={started} delay={0.7}>
            <ul className="mt-9 flex flex-wrap items-center gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="surface surface-hover grid h-11 w-11 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-fg"
                  >
                    <BrandIcon name={social.icon} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
              <li className="ml-1">
                <a
                  href={`mailto:${profile.email}`}
                  className="link-underline text-[0.9rem] text-muted transition-colors hover:text-fg"
                >
                  {profile.email}
                </a>
              </li>
            </ul>
          </FadeUp>
        </div>

        <FadeUp started={started} delay={0.85}>
          <div className="mt-14 flex items-end justify-between gap-8 border-t border-line pt-6">
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-2 max-w-[22ch] text-[0.78rem] leading-snug text-dim">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[clamp(1.5rem,3vw,2.3rem)] leading-none text-fg">
                    {started ? (
                      <CountUp
                        to={stat.value}
                        decimals={stat.decimals || 0}
                        prefix={stat.prefix || ""}
                        suffix={stat.suffix || ""}
                        comma={stat.comma}
                      />
                    ) : (
                      <span aria-hidden="true">0</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href="#overview"
              onClick={(event) => {
                event.preventDefault();
                scrollToId("overview");
              }}
              className="group hidden shrink-0 items-center gap-3 self-end text-[0.72rem] text-dim transition-colors hover:text-fg md:flex"
              aria-label="Scroll to overview"
            >
              <span className="font-mono tracking-[0.14em] uppercase">Scroll</span>
              <span className="relative grid h-9 w-9 place-items-center rounded-full border border-line transition-colors duration-300 group-hover:border-gold">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-gold"
                  style={{ animation: reduced ? undefined : "scroll-bob 1.8s ease-in-out infinite" }}
                />
              </span>
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
