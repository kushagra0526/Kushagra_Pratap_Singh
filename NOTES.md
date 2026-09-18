# Build notes

The site is now a sectioned portfolio, not a timeline. Structure:

```
Hero → Overview → Experience → Work → Stack → Highlights → Contact
```

Everything it says comes from [`src/data/content.js`](src/data/content.js).

## The timeline is gone

Removed at your call — the month-by-month structure was fighting the content
and the dates were half guesses. That also retires the six "approximate month"
questions: nothing on the page claims a date now except the internship
(Jun–Nov 2025) and the degree (2023–2027), both straight off the résumé.

## What answers the four questions you asked for

| Question | Where it's answered |
| --- | --- |
| Who I am | Hero (name, role, status) + Overview statement and quick facts |
| What I do | Overview's three pillars: backend & distributed systems, fullstack product, applied AI |
| What I know | Stack — 34 technologies in six groups, with logos |
| What I build | Work — three projects, each with a summary, highlights, stack and live/source links |

Plus Experience (the Marine Edge internship with six measured outcomes) and
Highlights (DSA, the GenAI workshop, CodeFlow AI, the ACM creative team, and
education).

## The 3D

Real WebGL, written against **three.js directly** rather than
react-three-fiber: R3F's current release pins React below 19.3 and you're on
19.3, so using it would have meant downgrading React. Vanilla three also keeps
the bundle smaller — no reconciler, no drei.

The hero object is a node graph on the vertices of an icosahedron, with signals
travelling its edges, a wireframe core and two orbit rings. It's meant to read
as a system rather than a decorative blob. It:

- follows the cursor, and sinks and shrinks slightly as you scroll past;
- loads as a **separate 134 kB (gzipped) chunk**, after the rest of the page;
- pauses completely when off-screen or when the tab is hidden;
- renders one static frame under `prefers-reduced-motion`;
- silently does nothing if WebGL is unavailable — the page just has no object.

I did not copy casadisolare.com's approach of a full-screen shader scene. That
site is a type foundry showing off; on a portfolio a recruiter opens on a work
laptop, seconds of WebGL boot time cost more than they win.

## Movement

| Where | What moves |
| --- | --- |
| Whole page | Lenis inertial scrolling (off under reduced motion) |
| Hero | Name reveals a line at a time from under a clipped edge; everything else fades up in sequence |
| Hero object | Cursor-follow, auto-rotation, travelling signals, scroll parallax |
| Buttons | Magnetic — they lean toward the cursor |
| Section titles | Big uppercase type masked up on arrival |
| Overview statement | Fills in word by word as it crosses the screen |
| Work stage | Projects swap with a 3D rotate-and-recede; the panel tips toward the cursor |
| Work list | Rows expand as an accordion; arrows rotate |
| Cards | Subtle 3D tilt on hover (pillars, stack groups, highlights) |
| Numbers | Count up on arrival |
| Nav | Active-section pill slides between items |
| Top of page | Scroll-progress hairline |

## Taken from itssharl.ee directly

Three things that site does, which the page now does too:

**The cursor.** Theirs is two fixed elements — a 4px dot that tracks the pointer
exactly and a 24px ring that trails it — both in `mix-blend-mode: difference`,
so they invert whatever is under them rather than having a colour of their own.
Ours works the same way, and adds a label: the ring swells and reads "open",
"visit", "code" or "copy" over the thing you're pointing at. Mouse only; the
native cursor is hidden only while the custom one is actually running, and the
whole thing is skipped for touch and for reduced motion.

**The hover preview.** Their work rows hold hidden 3000×2000 project images
that reveal on hover. We have no screenshots of your three apps, so instead each
row has a built cover — tinted gradient, engineering grid, the project number in
stroked type, name and category — that rides the cursor on a spring and tips
into the direction of travel. Same interaction, honest content. Send real
screenshots and they drop straight into that card.

**More than one 3D object.** Their loader says "Materializing shapes" for a
reason. Besides the hero's node graph there's now a torus knot floating in
Overview and an octahedron in Stack: dark faceted bodies with a gold or blue rim
light and a wireframe over the top, drifting and turning with the cursor. Each
one is its own small canvas that pauses when off-screen, and none of them load
on a phone. three.js is now a shared chunk, so the extra shapes cost about 1 kB
each rather than another copy of the library.

Also added: a fine film grain over the whole page, which takes the flatness off
large areas of navy.

## What's real, and what's illustrative

Every fabricated visual is gone — the invented dashboard mockup, the fake
contribution heatmap, the made-up terminal session, the stand-in posters. What
remains are diagrams of things that actually exist:

| Visual | Status |
| --- | --- |
| `RbacDiagram` (Experience) | Real structure: three tiers, real Razorpay sequence. Permission names are generic examples. |
| `VectorSpace` (Later, Probably) | Real mechanism — pgvector, HNSW, 1536 dimensions. Points are an abstract 2-D stand-in, and captioned as such. |
| `CrdtMerge` (Interlace) | Real RGA behaviour. The characters and ids are illustrative, and captioned. |
| `ServiceGraph` (Ecom) | Real architecture: three services, GraphQL gateway, Kafka. Event names are examples. |

Screenshots of the three live apps would be a genuine upgrade over diagrams,
but only one of the deployments currently shows anything (the other two are
behind sign-in or have a cold backend). Send screenshots any time and I'll swap
them in beside the diagrams.

## Copy I wrote rather than lifted

Résumé facts are intact; the framing is mine. Worth reading once:

- Hero: "I build backend systems that have to be right — permissions, payments,
  real-time sync — and the product surfaces people use on top of them."
- Overview statement: "…whether a payment went through exactly once, and whether
  two people editing the same file end up with the same file."
- The *Later, Probably* summary says you "get back a structured task with a time
  estimate" — the résumé says Gemini extracts structured fields and the app does
  task estimation, so this joins those two facts. Correct me if it overstates.
- Availability is stated as **2027** throughout (May 2027 graduation).

## Stack logos

From `simple-icons` (CC0). Four entries have no logo available — AWS Lambda,
DynamoDB, LinkedIn (all withdrawn at the brands' request) and the abstract ones
like RAG and CI/CD — so those get a small mono tag instead. Brand colours only
appear on hover, and only where the colour is actually visible on navy;
near-black brands (Express, Kafka, Prisma) fall back to cream.

## Bug found and fixed

A plain IntersectionObserver only fires when intersection *changes*. Jump past
an element — anchor link, restored scroll position, fast scrollbar drag — and it
goes from "below the fold" to "above the fold" without ever crossing a
threshold, so no callback runs and the element stays invisible permanently.
[`useRevealed`](src/hooks/useRevealed.js) now backs the observer with a position
check on mount and on scroll, so content can't be stranded.

## Accessibility

- `prefers-reduced-motion` disables Lenis, the intro, every reveal and count-up,
  and freezes the 3D object on one frame.
- Real landmarks, an accordion wired with `aria-expanded`/`aria-controls`, a
  live region on the copy-email button, focus-visible gold rings, a skip link,
  labelled SVG diagrams.
- No horizontal overflow at 375, 800, 1440 or 1600px.

## Still true from before

- The vapour intro is unchanged in behaviour — same dissolve, same 2.2s, same
  handoff — on the navy palette.
- `src/components/ui/container-scroll-animation.jsx` is the scroll-tilt card
  from the original brief. It's no longer used: the tilting-laptop treatment is
  a recognisable template look, and you asked for the opposite. The file is
  still there if you want it back.
- Your phone number is on the page and in the hosted résumé PDF.
