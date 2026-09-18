import React, { useEffect, useRef, useState } from "react";
import BrandIcon from "./BrandIcon";
import Magnetic from "./Magnetic";
import MaskText from "./MaskText";
import Reveal from "./Reveal";
import { scrollToId } from "../hooks/useSmoothScroll";
import { contact, links, profile, socials } from "../data/content";

function formatTime(timeZone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function useLocalTime(timeZone) {
  const [time, setTime] = useState(() => formatTime(timeZone));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timeZone)), 20000);
    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);
  const time = useLocalTime(profile.timeZone);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-20 border-t border-line pt-24 md:pt-36">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <p aria-hidden="true" className="font-mono text-[0.7rem] tracking-[0.16em] text-gold uppercase">
            06 <span className="text-dim">/</span> Contact
          </p>
        </Reveal>

        <h2 className="mt-6 font-display text-[clamp(2.8rem,10vw,8.5rem)] leading-[0.86] font-medium tracking-[-0.04em] text-fg uppercase">
          <MaskText>Let's build</MaskText>
          <br />
          <MaskText delay={0.08}>
            something <span className="text-gold">solid.</span>
          </MaskText>
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="max-w-[52ch] text-[1.08rem] leading-[1.7] text-muted">{contact.note}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-[0.92rem] font-medium text-bg transition-colors duration-300 hover:bg-gold"
                >
                  Email me <span aria-hidden="true">↗</span>
                </a>
              </Magnetic>

              <button
                type="button"
                onClick={copyEmail}
                className="surface surface-hover inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[0.92rem] text-fg"
              >
                {copied ? "Copied" : "Copy email"}
                <span aria-hidden="true" className="text-gold">
                  {copied ? "✓" : "⧉"}
                </span>
              </button>
              <span aria-live="polite" className="sr-only">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <a
            href={`mailto:${profile.email}`}
            className="mt-14 block font-display text-[clamp(1.3rem,4vw,3.2rem)] leading-tight break-all text-fg transition-colors duration-300 hover:text-gold"
          >
            {profile.email}
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 grid gap-10 border-t border-line py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">
                Elsewhere
              </p>
              <ul className="mt-4 space-y-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2.5 text-[0.95rem] text-muted transition-colors hover:text-fg"
                    >
                      <BrandIcon name={social.icon} className="h-4 w-4" />
                      <span className="link-underline">{social.label}</span>
                      <span aria-hidden="true" className="text-gold opacity-0 transition-opacity group-hover:opacity-100">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={links.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-[0.95rem] text-muted transition-colors hover:text-fg"
                  >
                    Résumé (PDF)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">Phone</p>
              <a
                href={`tel:${profile.phoneHref}`}
                className="link-underline mt-4 inline-block text-[0.95rem] text-muted transition-colors hover:text-fg"
              >
                {profile.phone}
              </a>
            </div>

            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">
                Based in
              </p>
              <p className="mt-4 text-[0.95rem] text-fg">{profile.location}</p>
              <p className="mt-1 font-mono text-[0.8rem] text-dim">{time} local time</p>
            </div>

            <div>
              <p className="font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">Status</p>
              <p className="mt-4 flex items-start gap-2.5 text-[0.95rem] text-fg">
                <span aria-hidden="true" className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full bg-mint" />
                {profile.status}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-6 py-7 font-mono text-[0.7rem] text-dim sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>
          © {new Date().getFullYear()} {profile.fullName}
        </p>
        <p>Built with React, three.js and Framer Motion.</p>
        <button
          type="button"
          onClick={() => scrollToId("top")}
          className="link-underline text-left transition-colors hover:text-fg"
        >
          Back to top ↑
        </button>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none px-6 pb-2 font-display text-[19vw] leading-[0.78] font-medium tracking-[-0.05em] text-transparent uppercase select-none [-webkit-text-stroke:1px_rgba(255,253,238,0.06)] md:px-10"
      >
        {profile.firstName}
      </p>
    </footer>
  );
}
