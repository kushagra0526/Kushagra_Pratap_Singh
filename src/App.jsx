import React, { useCallback, useEffect, useState } from "react";
import Portfolio from "./components/Portfolio";
import LoadingScreen from "./components/ui/LoadingScreen";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion";
import useSmoothScroll from "./hooks/useSmoothScroll";

// The vapour effect rasterises text to a canvas, so it needs the webfont to
// have actually arrived, otherwise the name dissolves in a fallback face.
// Hard cap the wait so a slow font CDN can never trap anyone on the splash.
const FONT_WAIT_MS = 1200;

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Anyone asking for reduced motion goes straight to the page.
  const [loading, setLoading] = useState(() => !prefersReducedMotion);
  const [fontsReady, setFontsReady] = useState(false);

  // Inertial scrolling, once the intro is out of the way.
  useSmoothScroll(!loading);

  useEffect(() => {
    if (!loading) return undefined;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setFontsReady(true);
    };

    const timer = setTimeout(finish, FONT_WAIT_MS);

    if (document.fonts?.load) {
      document.fonts
        .load("500 56px 'Clash Display'")
        .then(() => document.fonts.ready)
        .then(finish)
        .catch(finish);
    } else {
      finish();
    }

    return () => clearTimeout(timer);
  }, [loading]);

  // Hold the page still underneath the splash.
  useEffect(() => {
    if (!loading) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [loading]);

  const handleFinish = useCallback(() => setLoading(false), []);

  return (
    <>
      <Portfolio started={!loading} />

      {loading &&
        (fontsReady ? (
          <LoadingScreen onFinish={handleFinish} />
        ) : (
          // Stand-in painted with the same sky, so nothing flashes before the
          // splash takes over.
          <div
            className="fixed inset-0 z-50 bg-[radial-gradient(120%_80%_at_50%_-10%,#16213a_0%,#0b1524_45%,#08101b_100%)]"
            aria-hidden="true"
          />
        ))}
    </>
  );
}
