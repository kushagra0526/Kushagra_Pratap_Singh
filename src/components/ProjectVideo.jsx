import React, { useEffect, useRef, useState } from "react";
import ProjectPoster from "./ProjectPoster";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { PROJECT_TINTS } from "../lib/projectTints";

// The recordings are paced for narration; without it they drag, so they run
// quicker here.
const PLAYBACK_RATE = 1.75;

/**
 * A project's screen recording, set into the same tinted, gridded card as the
 * designed posters so it reads as part of the page rather than an embed.
 * Visuals only: always muted, no controls. It plays only while on screen,
 * stays on its first frame for reduced motion, and falls back to the poster
 * if the file ever fails to load.
 *
 * Keep this out of 3D transforms: a rotated or scaled layer is re-rasterised
 * and the recording's small UI text goes soft.
 */
export default function ProjectVideo({ project, size = "lg" }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const tint = PROJECT_TINTS[project.id] || PROJECT_TINTS["later-probably"];
  const large = size === "lg";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    // React doesn't reliably set `muted` as an attribute, and browsers only
    // allow autoplay for videos that are muted — so set it on the element.
    video.muted = true;
    video.defaultMuted = true;
    video.defaultPlaybackRate = PLAYBACK_RATE;
    video.playbackRate = PLAYBACK_RATE;
    if (reduced) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced, failed]);

  // Written straight to the element: a re-render per frame for a hairline
  // would be waste.
  const trackProgress = () => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (video && bar && video.duration) {
      bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
    }
  };

  if (!project.video || failed) return <ProjectPoster project={project} size={size} />;

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-line"
      style={{ background: "#0b1220" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 8% 0%, rgba(${tint.rgb},0.38), transparent 55%), radial-gradient(100% 90% at 100% 100%, rgba(${tint.rgb},0.2), transparent 55%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,253,238,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,253,238,0.1) 1px, transparent 1px)",
          backgroundSize: large ? "32px 32px" : "24px 24px",
        }}
      />

      <div className={`relative ${large ? "p-5 sm:p-6" : "p-4"}`}>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p
              className="font-mono tracking-[0.14em] uppercase"
              style={{ color: tint.hex, fontSize: large ? "0.68rem" : "0.6rem" }}
            >
              {project.category}
            </p>
            {/* Not a heading: the project's heading is its row in the list. */}
            <p
              className={`mt-1.5 truncate font-display leading-none tracking-[-0.02em] text-fg ${
                large ? "text-[1.9rem]" : "text-[1.35rem]"
              }`}
            >
              {project.name}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.14em] text-dim uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
            Demo
          </span>
        </div>

        <div
          className={`relative overflow-hidden rounded-xl border bg-[#0b1220] ${large ? "mt-5" : "mt-4"}`}
          style={{
            borderColor: `rgba(${tint.rgb},0.35)`,
            boxShadow: `0 24px 60px -28px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,253,238,0.03)`,
          }}
        >
          <div className="relative aspect-video">
            {/* A tinted wash shows while the first frame loads. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
              style={{
                background: `radial-gradient(120% 100% at 10% 0%, rgba(${tint.rgb},0.35), transparent 60%)`,
              }}
            />
            <video
              ref={videoRef}
              // #t nudges the browser to paint a real frame before playback.
              src={`${project.video}#t=0.1`}
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              aria-label={`Screen recording of ${project.name}`}
              onLoadedData={() => setReady(true)}
              onPlay={(event) => {
                event.currentTarget.playbackRate = PLAYBACK_RATE;
              }}
              onTimeUpdate={trackProgress}
              onError={() => setFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Playback progress, as a hairline in the project's colour. */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-bg/40" aria-hidden="true">
            <div
              ref={progressRef}
              className="h-full origin-left transition-transform duration-300 ease-linear"
              style={{ background: tint.hex, transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
