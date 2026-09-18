# Kushagra Pratap Singh — portfolio

A single-page portfolio: a vapour-dissolve intro, a WebGL hero, then Overview,
Experience, Work, Stack, Highlights and Contact.

React + Vite, plain JavaScript, Tailwind CSS v4, Framer Motion, three.js, Lenis.
Clash Display + Satoshi (Fontshare) on a `#08101B` / `#FFFDEE` palette.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Editing

| I want to change… | Edit |
| --- | --- |
| Any text, link, project, stat or stack item | `src/data/content.js` |
| Colours, fonts, shared utilities | `src/index.css` |
| The 3D hero object | `src/components/HeroScene.jsx` |
| A project diagram | `src/components/visuals/*` |

## Layout

```
src/
  App.jsx                    intro gate + smooth scrolling
  components/
    Portfolio.jsx            page assembly
    Nav.jsx                  fixed nav, active-section pill, mobile menu
    Hero.jsx                 name, intro, links, stats
    HeroScene.jsx            three.js node-graph object (lazy-loaded)
    Overview.jsx             statement, quick facts, three pillars
    Experience.jsx           internship, measured outcomes, RBAC diagram
    Work.jsx                 3D stage + project accordion
    Stack.jsx                six groups, logos from simple-icons
    Highlights.jsx           achievements + education
    Contact.jsx              contact block, copy-email, footer
    SectionHeading.jsx       numbered uppercase section titles
    Ambient.jsx              aurora + starfield behind the hero
    MaskText / ScrollText / Reveal / Tilt / Magnetic / CountUp / ScrollProgress
    visuals/                 RBAC, CRDT merge, service graph, vector space
    ui/                      vapour-text-effect, LoadingScreen
  hooks/
    useRevealed.js           reveal-on-arrival that can't strand content
    useSmoothScroll.js       Lenis + scrollToId
    useActiveSection.js      which section the nav should highlight
    useMediaQuery.js, usePrefersReducedMotion.js
```

See [NOTES.md](NOTES.md) for what's real, what's illustrative, and the copy
that's worth checking.
