import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandIcon from "./BrandIcon";
import { getLenis, scrollToId } from "../hooks/useSmoothScroll";
import { links, navItems, profile, socials } from "../data/content";

function buildItems(copyEmail) {
  const sections = navItems.map((item) => ({
    id: `go-${item.id}`,
    group: "Go to",
    label: item.label,
    hint: "Section",
    run: () => scrollToId(item.id),
  }));

  const elsewhere = [
    ...socials.map((social) => ({
      id: `link-${social.label}`,
      group: "Elsewhere",
      label: social.label,
      hint: "Opens in a new tab",
      icon: social.icon,
      run: () => window.open(social.href, "_blank", "noreferrer"),
    })),
    {
      id: "link-resume",
      group: "Elsewhere",
      label: "Résumé",
      hint: "Opens in a new tab",
      run: () => window.open(links.resume, "_blank", "noreferrer"),
    },
  ];

  const actions = [
    {
      id: "action-copy-email",
      group: "Actions",
      label: "Copy email address",
      hint: profile.email,
      run: copyEmail,
    },
    {
      id: "action-mailto",
      group: "Actions",
      label: "Email me",
      hint: "Opens your mail app",
      run: () => window.location.assign(`mailto:${profile.email}`),
    },
  ];

  return [...sections, ...elsewhere, ...actions];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const listRef = useRef(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.assign(`mailto:${profile.email}`);
    }
  };

  const items = useMemo(() => buildItems(copyEmail), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  const openPalette = () => {
    restoreFocusRef.current = document.activeElement;
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const closePalette = () => {
    setOpen(false);
    // Undo the "modal open" side effects right away rather than waiting for
    // the effect cleanup to catch up on the next render — a command's own
    // action (e.g. scrollToId) can run in the same tick and needs Lenis
    // already moving again.
    getLenis()?.start();
    document.documentElement.style.overflow = "";
    const node = restoreFocusRef.current;
    if (node && typeof node.focus === "function") node.focus();
  };

  const runItem = (item) => {
    if (!item) return;
    closePalette();
    item.run();
  };

  // Global Cmd/Ctrl+K from anywhere, plus an event so the status bar can open
  // it without this component's state having to be lifted.
  useEffect(() => {
    const show = () => {
      setOpen((was) => {
        if (was) return was;
        restoreFocusRef.current = document.activeElement;
        setQuery("");
        setActiveIndex(0);
        return true;
      });
    };

    const onKey = (event) => {
      const isK = event.key === "k" || event.key === "K";
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        show();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", show);
    };
  }, []);

  // Hold the page still, focus the input, and let Escape / arrows drive it while open.
  useEffect(() => {
    if (!open) return undefined;

    const lenis = getLenis();
    lenis?.stop();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        runItem(filtered[activeIndex]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let runningIndex = -1;
  const groups = filtered.reduce((acc, item) => {
    const bucket = acc.find((entry) => entry.group === item.group);
    if (bucket) bucket.items.push(item);
    else acc.push({ group: item.group, items: [item] });
    return acc;
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="surface surface-hover fixed right-4 bottom-4 z-20 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[0.78rem] text-muted backdrop-blur md:hidden"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true" className="text-gold">✦</span>
        Explore the site
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close command menu"
              onClick={closePalette}
              className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="surface relative w-full max-w-[30rem] overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span aria-hidden="true" className="text-dim">⌕</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jump to a section, a link, or an action…"
                  className="w-full bg-transparent py-4 text-[0.95rem] text-fg placeholder:text-dim focus:outline-none"
                  aria-label="Search commands"
                />
                <kbd className="hidden shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.64rem] text-dim sm:inline-block">
                  Esc
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
                {groups.length === 0 ? (
                  <p className="px-3 py-6 text-center text-[0.86rem] text-dim">Nothing matches that.</p>
                ) : (
                  groups.map((bucket) => (
                    <div key={bucket.group} className="mb-1 last:mb-0">
                      <p className="px-3 pt-2.5 pb-1 font-mono text-[0.62rem] tracking-[0.12em] text-dim uppercase">
                        {bucket.group}
                      </p>
                      {bucket.items.map((item) => {
                        runningIndex += 1;
                        const isActive = runningIndex === activeIndex;
                        const index = runningIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-active={isActive}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => runItem(item)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.92rem] transition-colors duration-150 ${
                              isActive ? "bg-raised text-fg" : "text-muted"
                            }`}
                          >
                            {item.icon ? (
                              <BrandIcon name={item.icon} className="h-4 w-4 shrink-0" />
                            ) : (
                              <span aria-hidden="true" className="w-4 shrink-0 text-center text-gold">
                                {item.group === "Go to" ? "→" : "·"}
                              </span>
                            )}
                            <span className="flex-1 truncate">
                              {item.id === "action-copy-email" && copied ? "Copied!" : item.label}
                            </span>
                            <span className="shrink-0 font-mono text-[0.7rem] text-dim">{item.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
