import React from "react";
import Ambient from "./Ambient";
import Contact, { Footer } from "./Contact";
import Cursor from "./Cursor";
import Experience from "./Experience";
import Hero from "./Hero";
import Highlights from "./Highlights";
import Nav from "./Nav";
import Overview from "./Overview";
import ScrollProgress from "./ScrollProgress";
import Stack from "./Stack";
import Work from "./Work";
import { scrollToId } from "../hooks/useSmoothScroll";

export default function Portfolio({ started = true }) {
  return (
    <div className="grain">
      <a
        href="#overview"
        onClick={(event) => {
          event.preventDefault();
          scrollToId("overview");
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-[0.8rem] focus:text-[#10121d]"
      >
        Skip to content
      </a>

      <Cursor />
      <ScrollProgress />
      <Ambient />
      <Nav />

      <main>
        <Hero started={started} />
        <Overview />
        <Experience />
        <Work />
        <Stack />
        <Highlights />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
