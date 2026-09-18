import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandIcon from "./BrandIcon";
import useActiveSection from "../hooks/useActiveSection";
import { getLenis, scrollToId } from "../hooks/useSmoothScroll";
import { links, navItems, profile, socials } from "../data/content";

const SECTION_IDS = navItems.map((item) => item.id);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hold the page still while the menu is open.
  useEffect(() => {
    if (!open) return undefined;
    const lenis = getLenis();
    lenis?.stop();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (event, id) => {
    event.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ${
          scrolled || open ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-6 md:px-10"
        >
          <a
            href="#top"
            onClick={(event) => go(event, "top")}
            className="group flex items-center gap-3"
            aria-label={`${profile.fullName}, back to top`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface font-display text-[0.75rem] tracking-tight text-gold transition-colors duration-300 group-hover:border-gold">
              KPS
            </span>
            <span className="hidden font-display text-[0.98rem] tracking-tight text-fg sm:inline">
              {profile.fullName}
            </span>
          </a>

          <ul className="surface hidden items-center gap-0.5 rounded-full p-1 lg:flex">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => go(event, item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block rounded-full px-4 py-1.5 text-[0.84rem] transition-colors duration-300 ${
                      isActive ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-raised"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={links.resume}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-[0.84rem] font-medium text-bg transition-colors duration-300 hover:bg-gold sm:inline-flex"
            >
              Résumé <span aria-hidden="true">↗</span>
            </a>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="surface grid h-10 w-10 place-items-center rounded-full lg:hidden"
            >
              <span className="relative block h-3 w-4" aria-hidden="true">
                <span
                  className={`absolute left-0 block h-px w-4 bg-fg transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0.5"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-4 bg-fg transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-2.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 flex flex-col bg-bg/95 px-6 pt-24 pb-10 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line"
                >
                  <a
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={`#${item.id}`}
                    onClick={(event) => go(event, item.id)}
                    className="flex items-baseline justify-between py-5 font-display text-[2.1rem] leading-none text-fg uppercase"
                  >
                    {item.label}
                    <span className="font-mono text-[0.7rem] text-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap gap-2 pt-10">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="surface surface-hover inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.85rem] text-fg"
                >
                  <BrandIcon name={social.icon} className="h-4 w-4" />
                  {social.label}
                </a>
              ))}
              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2.5 text-[0.85rem] font-medium text-bg"
              >
                Résumé <span aria-hidden="true">↗</span>
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
