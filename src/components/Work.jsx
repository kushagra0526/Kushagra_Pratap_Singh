import React, { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import ProjectPoster from "./ProjectPoster";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Tilt from "./Tilt";
import useMediaQuery from "../hooks/useMediaQuery";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { projects } from "../data/content";

const EASE = [0.22, 1, 0.36, 1];

/**
 * The card that rides the cursor while you run down the project list: the
 * hover preview from the reference site, built as full cover art instead of
 * a captured screenshot.
 */
function HoverPreview({ project, pointerX, pointerY }) {
  const x = useSpring(pointerX, { stiffness: 220, damping: 26, mass: 0.5 });
  const y = useSpring(pointerY, { stiffness: 220, damping: 26, mass: 0.5 });
  // Lean into the movement: the gap between raw and eased position is velocity.
  const rotate = useTransform([pointerX, x], ([raw, eased]) => (raw - eased) * 0.05);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[26rem] lg:block"
      style={{ x, y, translateX: "-50%", translateY: "-58%", rotate }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <div className="shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]">
        <ProjectPoster project={project} size="sm" />
      </div>
    </motion.div>
  );
}

/** The stage: the active project's full poster, tipped in 3D space. */
function Stage({ project }) {
  const reduced = usePrefersReducedMotion();

  return (
    <Tilt max={4} scale={1}>
      <div style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project.id}
            style={{ transformStyle: "preserve-3d" }}
            initial={reduced ? false : { opacity: 0, rotateY: -18, rotateX: 8, z: -140 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, rotateY: -6, rotateX: 4, z: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, rotateY: 12, rotateX: 0, z: -140 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div style={{ transform: "translateZ(24px)" }}>
              <ProjectPoster project={project} size="lg" />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 left-[10%] h-14 w-[80%] rounded-[50%] bg-black/60 blur-2xl"
              style={{ transform: "translateZ(-60px)" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </Tilt>
  );
}

function ProjectRow({ project, open, onToggle, onPreview, showVisual }) {
  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          id={`${project.id}-trigger`}
          aria-expanded={open}
          aria-controls={`${project.id}-panel`}
          data-cursor={open ? "close" : "open"}
          onClick={onToggle}
          onMouseEnter={onPreview}
          onFocus={onPreview}
          className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-4 py-7 text-left"
        >
          <span className={`font-mono text-[0.72rem] ${open ? "text-gold" : "text-dim"}`}>
            {project.index}
          </span>

          <span className="min-w-0">
            <span
              className={`block font-display text-[clamp(1.6rem,3.2vw,2.65rem)] leading-[1.03] tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-3 ${
                open ? "text-fg" : "text-fg/80"
              }`}
            >
              {project.name}
            </span>
            <span className="mt-2 block text-[0.86rem] text-muted transition-transform duration-500 group-hover:translate-x-3">
              {project.category}
            </span>
          </span>

          <span
            aria-hidden="true"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-[0.95rem] transition-all duration-500 ${
              open
                ? "rotate-90 border-gold bg-gold text-bg"
                : "border-line text-fg group-hover:border-gold group-hover:text-gold"
            }`}
          >
            →
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${project.id}-panel`}
            role="region"
            aria-labelledby={`${project.id}-trigger`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-9 sm:pl-[3.25rem]">
              <p className="max-w-[54ch] text-[1.02rem] leading-[1.7] text-fg">{project.summary}</p>

              <ul className="mt-5 space-y-2.5">
                {project.highlights.map((highlight) => (
                  <li
                    key={highlight.slice(0, 24)}
                    className="flex gap-3 text-[0.97rem] leading-relaxed text-muted"
                  >
                    <span aria-hidden="true" className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <ul className="mt-6 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.64rem] text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="visit"
                  className="inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-[0.84rem] font-medium text-bg transition-colors duration-300 hover:bg-gold"
                >
                  Live <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="code"
                  className="surface surface-hover inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.84rem] text-fg"
                >
                  Source <span aria-hidden="true" className="text-gold">↗</span>
                </a>
              </div>

              {showVisual ? (
                <div className="mt-8">
                  <ProjectPoster project={project} size="sm" />
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export default function Work() {
  const [openId, setOpenId] = useState(projects[0].id);
  const [previewId, setPreviewId] = useState(null);
  const isWide = useMediaQuery("(min-width: 1024px)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduced = usePrefersReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const stageProject =
    projects.find((project) => project.id === (previewId || openId)) || projects[0];
  const previewProject = projects.find((project) => project.id === previewId);
  const showPreview = isWide && finePointer && !reduced && previewProject;

  const trackPointer = (event) => {
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
  };

  return (
    <section id="work" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <SectionHeading
          index="03"
          title="Work"
          note="Three systems I built end to end, mostly to understand how they really work."
        />

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {isWide ? (
            <div>
              <div className="sticky top-28">
                <Stage project={stageProject} />
              </div>
            </div>
          ) : null}

          <Reveal>
            <ul
              className="border-t border-line"
              onPointerMove={trackPointer}
              onPointerEnter={trackPointer}
              onPointerLeave={() => setPreviewId(null)}
            >
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  open={openId === project.id}
                  onToggle={() => setOpenId(openId === project.id ? null : project.id)}
                  onPreview={() => setPreviewId(project.id)}
                  showVisual={!isWide}
                />
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <AnimatePresence>
        {showPreview ? (
          <HoverPreview key={previewProject.id} project={previewProject} pointerX={pointerX} pointerY={pointerY} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
