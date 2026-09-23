import React, { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const OUTER_COUNT = 46;
// Loose points inside the shell, with no edges of their own.
//
// A projected sphere already stacks its near and far surfaces on top of each
// other in the middle of the disc, so that is the busiest part of the picture
// before anything is added. Meshing an inner shell there as well turned the
// centre into a knot. Unjoined points still give the inside something to be
// made of, and read as depth rather than as more structure.
const INNER_COUNT = 14;
const INNER_RADIUS = 0.5;
const PACKET_COUNT = 14;
const FOV = 3.1;

// The canvas is drawn larger than the box the hero lays out, so the sphere has
// room to swell when it is spun. At rest it is exactly the size it always was;
// without the headroom an expanded rim would run into the canvas's square edge
// and be cut off in a straight line.
const STAGE = 1.4;
const RADIUS = 0.38 / STAGE;

// Dragging. Rotation per pixel is tuned so a drag across the sphere turns it
// roughly a quarter; velocity is capped so a hard flick spins fast without
// becoming a blur.
const ROTATE_PER_PX = 0.0055;
const MAX_SPIN_VELOCITY = 12;
// How far the sphere may swell, as a fraction of its resting size.
const MAX_EXPAND = 0.45;

/** Lit nodes, spread evenly down the outer shell so labels never stack. */
function anchorsFor(count) {
  return Array.from({ length: count }, (_, index) =>
    Math.round(((index + 0.5) / count) * (OUTER_COUNT - 1))
  );
}

/** Deterministic, so the per-node variation is identical on every load. */
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly spaced points on a shell — no clumping, unlike random placement. */
function shell(count, radius, spin, random, index0) {
  const golden = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    // The inner shell is turned off the outer one's phase, so its points sit
    // in the gaps rather than hiding directly behind their outer neighbours.
    const theta = golden * index + spin;
    return {
      x: Math.cos(theta) * ring * radius,
      y: y * radius,
      z: Math.sin(theta) * ring * radius,
      shell: index0,
      // Identical dots read as a printed pattern; a little spread in size and
      // a slow out-of-phase shimmer make it read as lit points instead.
      gain: 0.75 + random() * 0.6,
      phase: random() * Math.PI * 2,
      // How far this point travels when the sphere swells. Uneven, so it
      // opens like something breaking apart rather than a ball being scaled;
      // the loose inner points travel furthest, which is what makes the core
      // look like it is bursting outward.
      spread: (0.8 + random() * 0.5) * (index0 === 1 ? 1.6 : 1),
    };
  });
}

function buildSphere() {
  const random = mulberry32(20260920);
  return [
    ...shell(OUTER_COUNT, 1, 0, random, 0),
    ...shell(INNER_COUNT, INNER_RADIUS, 0.6, random, 1),
  ];
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Every pair closer than a threshold, rather than each node's k nearest.
 *
 * A k-nearest graph is not symmetric — a node can be someone's neighbour
 * without them being its own — so after de-duplicating, patches of the sphere
 * end up with noticeably fewer lines than the rest and read as holes. Joining
 * everything within one radius gives even coverage all over the surface.
 *
 * The radius is derived from the points themselves, so it stays correct if
 * the node count changes rather than being a number tuned for one value.
 */
function buildEdges(nodes) {
  const edges = [];
  const degree = new Array(nodes.length).fill(0);
  const join = (a, b) => {
    edges.push([a, b]);
    degree[a] += 1;
    degree[b] += 1;
  };

  // Only the outer shell is wired. The inner points are left loose on
  // purpose — see INNER_COUNT.
  const members = nodes.reduce((list, node, index) => {
    if (node.shell === 0) list.push(index);
    return list;
  }, []);

  const nearest = members.map((index) => {
    let best = Infinity;
    members.forEach((other) => {
      if (other === index) return;
      best = Math.min(best, distance(nodes[index], nodes[other]));
    });
    return best;
  });

  const median = [...nearest].sort((a, b) => a - b)[Math.floor(nearest.length / 2)];
  const threshold = median * 1.5;

  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      if (distance(nodes[members[i]], nodes[members[j]]) <= threshold) {
        join(members[i], members[j]);
      }
    }
  }

  // No point on the shell should be left floating unattached.
  members.forEach((index) => {
    if (degree[index] > 0) return;
    let pick = -1;
    let best = Infinity;
    members.forEach((other) => {
      if (other === index) return;
      const d = distance(nodes[index], nodes[other]);
      if (d < best) {
        best = d;
        pick = other;
      }
    });
    if (pick >= 0) join(index, pick);
  });

  return edges;
}

/**
 * One radial-gradient glow, rendered once into its own canvas and then
 * stamped per node. Building a gradient per node per frame is the expensive
 * way to do this; blitting a sprite is close to free.
 */
function makeGlow(rgb, peak = 0.85, mid = 0.22) {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const context = sprite.getContext("2d");
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${rgb},${peak})`);
  gradient.addColorStop(0.35, `rgba(${rgb},${mid})`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return sprite;
}

/** Right-most edge of an element's actual glyphs, not its block box. */
function glyphRight(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let right = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0) right = Math.max(right, rect.right);
  }
  return right;
}

export default function SystemGraph({ labels = [], avoidRef = null }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const labelRefs = useRef([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const context = canvas.getContext("2d");
    const nodes = buildSphere();
    const edges = buildEdges(nodes);
    const anchors = anchorsFor(labels.length);
    const creamGlow = makeGlow("255,253,238");
    const goldGlow = makeGlow("237,179,88");
    // Warm, and much softer than the node glows — this one is atmosphere,
    // picking up the tone of the wash already behind the hero so the sphere
    // sits in the page instead of on top of it.
    const coreGlow = makeGlow("214,120,70", 0.3, 0.09);

    const packets = Array.from({ length: PACKET_COUNT }, () => ({
      edge: Math.floor(Math.random() * edges.length),
      t: Math.random(),
      // Edge fractions per second.
      speed: 0.15 + Math.random() * 0.24,
    }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let spin = 0;
    let elapsed = 0;
    let tiltTarget = 0;
    let turnTarget = 0;
    let tilt = 0;
    let turn = 0;

    // Direct manipulation. Velocity is what the sphere carries after the
    // pointer lets go; the expansion is driven off it, so a hard flick swells
    // the sphere and it contracts again as the spin dies away.
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMoveAt = 0;
    let yawVelocity = 0;
    let pitchVelocity = 0;
    let pitchOffset = 0;
    let expand = 1;
    let zoomBoost = 0;
    let lastZoomAt = -Infinity;
    let hint = null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Where a label stops being allowed, in canvas-local px. Measured from the
    // element it has to stay clear of rather than set as a fraction: the
    // canvas is placed as a percentage of the section while the headline
    // scales on vw and then caps, so any fixed fraction that clears the type
    // at one width sits inside it at another.
    let gate = 0;
    // The right-hand limit, also canvas-local: the section clips at the
    // viewport edge, so a label that runs past it is cut off mid-word.
    let edge = Infinity;
    // Label boxes, measured rather than guessed so decluttering compares real
    // extents. Re-read on the same slow cadence, since they only change size
    // when the display face finishes loading.
    let sizes = [];
    const measureGate = () => {
      const left = wrap.getBoundingClientRect().left;
      edge = window.innerWidth - left - 16;
      sizes = labelRefs.current.map((node) =>
        node ? { w: node.offsetWidth, h: node.offsetHeight } : { w: 0, h: 0 }
      );

      const element = avoidRef?.current;
      gate = element ? glyphRight(element) - left + 24 : 0;
    };

    const resize = () => {
      // clientWidth/Height, not getBoundingClientRect: the rect is
      // transform-aware, so while the entry animation is still scaling the
      // box this reports 92% of the real size and the canvas is locked to
      // that forever. Layout size ignores the transform and is stable.
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureGate();
    };
    resize();

    // The sphere's centre and rim on screen, for hit-testing. The hero copy
    // sits on top of the canvas, so the canvas never receives the pointer
    // itself — drags are picked up on the window and tested against this
    // circle instead.
    const onSphere = (clientX, clientY) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // 1.06 is the most perspective can push a point past the unit radius.
      const rim = rect.width * RADIUS * 1.06 * expand * 1.08;
      return Math.hypot(clientX - cx, clientY - cy) <= rim;
    };

    // Links and buttons keep their own clicks; the sphere only takes a drag
    // that starts on empty space or on plain text.
    const isControl = (target) =>
      !!target?.closest?.("a, button, input, textarea, select, label, [role='dialog']");

    const setHint = (next) => {
      if (next === hint) return;
      hint = next;
      window.dispatchEvent(new CustomEvent("cursor-hint", { detail: next }));
    };

    const onPointer = (event) => {
      const rect = wrap.getBoundingClientRect();
      // Normalised to the sphere, then clamped: a pointer far across the page
      // should not crank the rotation to an extreme. The canvas is STAGE times
      // the sphere's box, so the offset is scaled back up to match.
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * STAGE;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2 * STAGE;
      turnTarget = Math.max(-1, Math.min(1, nx)) * 0.5;
      tiltTarget = Math.max(-1, Math.min(1, ny)) * 0.35;

      if (dragging) {
        const now = performance.now();
        const dt = Math.max((now - lastMoveAt) / 1000, 0.008);
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        spin += dx * ROTATE_PER_PX;
        pitchOffset = Math.max(-0.9, Math.min(0.9, pitchOffset + dy * ROTATE_PER_PX * 0.7));

        // Smoothed, because pointer events arrive unevenly and a raw
        // distance-over-time spikes whenever two land close together.
        const clamp = (value) => Math.max(-MAX_SPIN_VELOCITY, Math.min(MAX_SPIN_VELOCITY, value));
        yawVelocity = clamp(yawVelocity * 0.6 + ((dx * ROTATE_PER_PX) / dt) * 0.4);
        pitchVelocity = clamp(pitchVelocity * 0.6 + ((dy * ROTATE_PER_PX * 0.7) / dt) * 0.4);

        lastX = event.clientX;
        lastY = event.clientY;
        lastMoveAt = now;
        return;
      }

      if (event.pointerType === "touch") return;
      setHint(onSphere(event.clientX, event.clientY) && !isControl(event.target) ? "drag" : null);
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      document.documentElement.classList.remove("sphere-dragging");
      // The release keeps whatever velocity the last movement had — that is
      // the flick, and it carries the spin on after the pointer lets go.
      if (performance.now() - lastMoveAt > 120) {
        yawVelocity = 0;
        pitchVelocity = 0;
      }
    };

    const onDown = (event) => {
      // Mouse and pen only. On touch, a drag across the hero is someone
      // scrolling the page, and taking it over would trap them.
      if (event.pointerType === "touch" || event.button !== 0) return;
      if (isControl(event.target) || !onSphere(event.clientX, event.clientY)) return;

      event.preventDefault();
      window.getSelection?.()?.removeAllRanges();
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveAt = performance.now();
      yawVelocity = 0;
      pitchVelocity = 0;
      document.documentElement.classList.add("sphere-dragging");
    };

    // A pinch on a trackpad arrives as a wheel event with ctrlKey set, as does
    // Ctrl+scroll on a mouse. Plain scrolling is left alone: a sphere this
    // size sitting in the hero would otherwise swallow the page's scroll.
    const onWheel = (event) => {
      if (!event.ctrlKey || !onSphere(event.clientX, event.clientY)) return;
      event.preventDefault();
      const step = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 40) * 0.006;
      zoomBoost = Math.max(-0.15, Math.min(MAX_EXPAND, zoomBoost - step));
      lastZoomAt = performance.now();
    };

    const project = (node) => {
      // Y spin, then X tilt.
      const cosA = Math.cos(spin + turn);
      const sinA = Math.sin(spin + turn);
      const x1 = node.x * cosA - node.z * sinA;
      const z1 = node.x * sinA + node.z * cosA;

      const pitch = tilt + pitchOffset;
      const cosB = Math.cos(pitch);
      const sinB = Math.sin(pitch);
      const y1 = node.y * cosB - z1 * sinB;
      const z2 = node.y * sinB + z1 * cosB;

      const scale = FOV / (FOV + z2);
      const swell = 1 + (expand - 1) * node.spread;
      const radius = Math.min(width, height) * RADIUS * swell;

      return {
        x: width / 2 + x1 * radius * scale,
        y: height / 2 + y1 * radius * scale,
        depth: z2,
        scale,
      };
    };

    let sinceGate = 0;

    const draw = () => {
      // Re-measured on a slow cadence rather than wired to every event that
      // could move the headline — fonts, entry animation, resize, zoom. One
      // forced layout twice a second is cheaper than being wrong.
      sinceGate -= 1;
      if (sinceGate <= 0) {
        measureGate();
        sinceGate = 30;
      }

      context.clearRect(0, 0, width, height);

      const points = nodes.map(project);
      // 0 at the front of the sphere, 1 at the back. Everything below reads
      // from this so near and far are consistently separated.
      const far = (depth) => Math.min(1, Math.max(0, (depth + 1) / 2));

      // A haze at the middle, under everything. Without it the centre of the
      // ball is the emptiest part of the canvas, which is what makes a
      // wireframe sphere look like an outline rather than an object.
      const bodyRadius = Math.min(width, height) * (0.4 / STAGE) * expand;
      context.globalAlpha = 0.5;
      context.drawImage(
        coreGlow,
        width / 2 - bodyRadius,
        height / 2 - bodyRadius,
        bodyRadius * 2,
        bodyRadius * 2
      );
      context.globalAlpha = 1;

      // Each edge is stroked with a gradient between its two endpoints rather
      // than one flat alpha for the pair. A single averaged alpha makes a line
      // running front-to-back look equally lit along its length, which flattens
      // the whole mesh; fading it end to end is what gives the ball volume.
      edges.forEach(([a, b]) => {
        const pa = points[a];
        const pb = points[b];
        // A steep curve, not a gentle one. The far surface projects straight
        // onto the near one through the middle of the disc, so anything the
        // back is still allowed to draw lands exactly where the picture is
        // already busiest. Dropping it away quickly leaves a readable dome.
        const aa = 0.5 * (1 - far(pa.depth)) ** 2.8;
        const ab = 0.5 * (1 - far(pb.depth)) ** 2.8;
        if (aa < 0.004 && ab < 0.004) return;

        const gradient = context.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
        gradient.addColorStop(0, `rgba(255,253,238,${aa})`);
        gradient.addColorStop(1, `rgba(255,253,238,${ab})`);
        context.strokeStyle = gradient;
        context.lineWidth = 0.5 + (1 - (far(pa.depth) + far(pb.depth)) / 2) * 0.7;
        context.beginPath();
        context.moveTo(pa.x, pa.y);
        context.lineTo(pb.x, pb.y);
        context.stroke();
      });

      // Nodes back-to-front so near ones sit on top, each stamped as a glow
      // plus a crisp core. The glow is what stops them reading as flat dots.
      const order = points
        .map((point, index) => ({ point, index }))
        .sort((a, b) => b.point.depth - a.point.depth);

      order.forEach(({ point, index }) => {
        const node = nodes[index];
        const isAnchor = anchors.indexOf(index) >= 0;
        const depthLit = (1 - far(point.depth)) ** 1.5;
        const shimmer = 0.88 + Math.sin(elapsed * 1.1 + node.phase) * 0.12;
        // The inner points are held well back so the shell keeps the
        // silhouette; at equal weight the two read as one noisy cloud.
        const inner = node.shell === 1 ? 0.42 : 1;
        const lit = Math.max(0.05, depthLit * shimmer * inner);

        const core = (isAnchor ? 2.6 : 1.5) * node.gain * point.scale * (inner < 1 ? 0.7 : 1);
        const halo = core * (isAnchor ? 9 : 6);
        const sprite = isAnchor ? goldGlow : creamGlow;

        context.globalAlpha = lit * (isAnchor ? 0.85 : 0.5);
        context.drawImage(sprite, point.x - halo, point.y - halo, halo * 2, halo * 2);

        context.globalAlpha = 1;
        context.fillStyle = isAnchor
          ? `rgba(247,206,140,${Math.min(1, lit + 0.15)})`
          : `rgba(255,253,238,${lit})`;
        context.beginPath();
        context.arc(point.x, point.y, core, 0, Math.PI * 2);
        context.fill();
      });

      // Events in flight, each with a short tail so the direction of travel
      // is legible rather than a dot that appears to sit still.
      packets.forEach((packet) => {
        const [a, b] = edges[packet.edge];
        const pa = points[a];
        const pb = points[b];
        const depth = pa.depth + (pb.depth - pa.depth) * packet.t;
        const lit = (1 - far(depth)) ** 1.4;
        if (lit < 0.02) return;

        for (let step = 0; step < 5; step += 1) {
          const t = Math.max(0, packet.t - step * 0.045);
          const x = pa.x + (pb.x - pa.x) * t;
          const y = pa.y + (pb.y - pa.y) * t;
          const scale = pa.scale + (pb.scale - pa.scale) * t;
          const falloff = (1 - step / 5) ** 2;
          context.fillStyle = `rgba(237,179,88,${lit * falloff * 0.8})`;
          context.beginPath();
          context.arc(x, y, (1.5 - step * 0.2) * scale, 0, Math.PI * 2);
          context.fill();
        }

        const hx = pa.x + (pb.x - pa.x) * packet.t;
        const hy = pa.y + (pb.y - pa.y) * packet.t;
        context.globalAlpha = lit * 0.55;
        const flare = 9;
        context.drawImage(goldGlow, hx - flare, hy - flare, flare * 2, flare * 2);
        context.globalAlpha = 1;
      });

      // Labels are DOM, not canvas, so the type stays crisp and selectable.
      // When the graph runs behind the headline, a label is only shown once
      // its node has carried it clear of the text column — which is why this
      // can sit under the type without ever colliding with it.
      const candidates = anchors.map((nodeIndex, labelIndex) => {
        const point = points[nodeIndex];
        const size = sizes[labelIndex] || { w: 0, h: 0 };

        // Label to the right of its node by default; flipped to the left
        // when that would run past the edge and be clipped.
        const flip = point.x + 12 + size.w > edge;
        const x = flip ? point.x - 12 - size.w : point.x + 12;
        const y = point.y - 10;

        // Generous, because `fade` already dims a label as it travels round
        // the back. Cutting at the midpoint instead left labels hidden for
        // long stretches, which reads as the feature being broken.
        const front = point.depth < 0.7;
        // depth runs negative on the near side, so this needs an upper clamp
        // too or the near labels resolve to an opacity above 1.
        const fade = Math.min(1, Math.max(0.25, 1 - point.depth * 0.9));
        // Ramped rather than switched, so a label emerges from behind the
        // text column instead of blinking on at the boundary. Measured from
        // the label's own left edge, so a flipped label is held back too.
        const zoneFade = Math.min(1, Math.max(0, (x - gate) / 90));

        return {
          labelIndex,
          depth: point.depth,
          x,
          y,
          w: size.w,
          h: size.h,
          opacity: front ? fade * zoneFade : 0,
        };
      });

      // Nearest first, and anything that would overlap a label already placed
      // is dropped for this frame. With a handful of labels they can simply
      // be spaced apart; with a page's worth on one sphere they will meet, and
      // letting the nearer one win keeps the reading order front-to-back.
      const placed = [];
      candidates
        .sort((a, b) => a.depth - b.depth)
        .forEach((label) => {
          if (label.opacity > 0.05) {
            const hit = placed.some(
              (other) =>
                label.x < other.x + other.w + 6 &&
                label.x + label.w + 6 > other.x &&
                label.y < other.y + other.h + 4 &&
                label.y + label.h + 4 > other.y
            );
            if (hit) label.opacity = 0;
            else placed.push(label);
          }

          const node = labelRefs.current[label.labelIndex];
          if (!node) return;
          node.style.transform = `translate3d(${label.x}px, ${label.y}px, 0)`;
          node.style.opacity = String(label.opacity);
        });
    };

    // Everything below advances per second, not per frame. Frame-stepping
    // ties the rotation to the display: the same code runs 2.4x faster on a
    // 144Hz panel than a 60Hz one, and crawls to a stop whenever the browser
    // throttles a background or unfocused tab.
    let last = 0;
    const tick = (now) => {
      if (!running) return;
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;

      elapsed += delta;
      if (dragging) {
        // The pointer turns it directly (see onPointer). Holding still while
        // pressed should let the swell relax, so the velocity bleeds off fast.
        spin += delta * 0.2;
        yawVelocity *= Math.pow(0.02, delta);
        pitchVelocity *= Math.pow(0.02, delta);
      } else {
        // Idle spin plus whatever the last flick left behind, bleeding away
        // on friction; the drag's tilt drifts back to level on its own.
        spin += (0.2 + yawVelocity) * delta;
        pitchOffset += pitchVelocity * delta;
        pitchOffset = Math.max(-0.9, Math.min(0.9, pitchOffset)) * Math.pow(0.35, delta);
        yawVelocity *= Math.pow(0.18, delta);
        pitchVelocity *= Math.pow(0.18, delta);
      }

      // Pinch zoom holds while the gesture is going, then lets go.
      if (performance.now() - lastZoomAt > 250) zoomBoost *= Math.pow(0.12, delta);

      const spinSwell = Math.min(
        MAX_EXPAND,
        Math.abs(yawVelocity) * 0.09 + Math.abs(pitchVelocity) * 0.07
      );
      const target = Math.max(0.85, Math.min(1 + MAX_EXPAND, 1 + spinSwell + zoomBoost));
      expand += (target - expand) * (1 - Math.pow(0.0015, delta));

      // Framerate-independent easing towards the pointer target.
      const ease = 1 - Math.pow(0.05, delta);
      turn += (turnTarget - turn) * ease;
      tilt += (tiltTarget - tilt) * ease;

      packets.forEach((packet) => {
        packet.t += packet.speed * delta;
        if (packet.t >= 1) {
          packet.t = 0;
          packet.edge = Math.floor(Math.random() * edges.length);
        }
      });

      draw();
      frame = requestAnimationFrame(tick);
    };

    if (reduced) {
      draw();
      return () => {};
    }

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      last = 0; // so the frame after a resume is not charged for the pause
      cancelAnimationFrame(frame);
    };

    // Never burn frames on a graph nobody is looking at.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { rootMargin: "10% 0px" }
    );
    observer.observe(wrap);

    const onVisibility = () => (document.hidden ? stop() : start());

    running = false;
    start();

    // The box is scaled up by the entry animation, so a size captured on
    // mount is the 92% version and the canvas stays smaller than its
    // container for good — undersized, and offset up and left of centre
    // because the canvas anchors top-left. Watching the element catches the
    // animation settling as well as any later layout change.
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(wrap);

    // The box is rem-sized, so a window resize can leave it unchanged while
    // still moving the headline the label gate is measured against.
    window.addEventListener("resize", measureGate);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    // Releasing outside the window never sends pointerup, so losing focus
    // counts as letting go — otherwise the sphere stays glued to the mouse.
    window.addEventListener("blur", endDrag);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("visibilitychange", onVisibility);

    // The display face swapping in changes the headline's width, which moves
    // the keep-out edge the labels are measured against.
    document.fonts?.ready.then(measureGate).catch(() => {});

    return () => {
      stop();
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("resize", measureGate);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("blur", endDrag);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("sphere-dragging");
      setHint(null);
    };
  }, [reduced, avoidRef, labels]);

  return (
    // -inset-[20%] makes this 1.4x the box on each axis: keep it in step with
    // STAGE. The extra is headroom for the sphere to swell into.
    <div ref={wrapRef} className="absolute -inset-[20%]">
      {/* Feathered rim. Drawn straight, the mesh stops dead on a circle and
          reads as a sticker on the page; fading the outer band lets it settle
          into the wash behind the hero. At rest the fade starts just outside
          the sphere, so a swollen rim melts outward instead of being cropped. */}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
        style={{
          maskImage: "radial-gradient(circle at 50% 50%, #000 44%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 44%, transparent 72%)",
        }}
      />

      {/* Deliberately not buttons. The graph is transformed, which makes it a
          stacking context, so nothing inside it can paint above the hero copy
          and a control here would never receive the click. */}
      {labels.map((label, index) => (
        <span
          key={label.call}
          ref={(node) => {
            labelRefs.current[index] = node;
          }}
          className="pointer-events-none absolute top-0 left-0 block font-mono text-[0.62rem] leading-tight tracking-[0.06em] whitespace-nowrap will-change-transform"
          style={{ opacity: 0 }}
        >
          <span className="block text-gold">{label.call}</span>
          <span className="block text-dim">{label.note}</span>
        </span>
      ))}
    </div>
  );
}
