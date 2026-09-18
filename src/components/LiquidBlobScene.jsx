import React, { useEffect, useRef } from "react";

// A fullscreen triangle, cheaper than a quad: no index buffer, no
// off-screen fragments to discard beyond the viewport.
const VERTEX_SRC = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Raymarched metaballs: a handful of spheres merged with a smooth-min, lit
// and given a fresnel rim so they read as glossy liquid rather than flat
// circles. Renders nothing (alpha 0) where the ray never hits, so it
// composites straight over the page behind it.
const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;

float sdSphere(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  float t = uTime;
  vec3 c1 = vec3(sin(t * 0.32) * 0.85, cos(t * 0.26) * 0.55, sin(t * 0.21) * 0.5);
  vec3 c2 = vec3(
    cos(t * 0.29) * 0.7 + uPointer.x * 0.85 * uPointerStrength,
    sin(t * 0.37) * 0.6 + uPointer.y * 0.85 * uPointerStrength,
    cos(t * 0.18) * 0.55
  );
  vec3 c3 = vec3(sin(t * 0.21 + 2.1) * 0.68, cos(t * 0.31 + 1.3) * 0.5, sin(t * 0.42) * 0.42);
  vec3 c4 = vec3(cos(t * 0.17 + 3.2) * 0.58, sin(t * 0.25 + 2.4) * 0.52, cos(t * 0.34) * 0.46);

  float d = sdSphere(p, c1, 0.58);
  d = smin(d, sdSphere(p, c2, 0.5), 0.55);
  d = smin(d, sdSphere(p, c3, 0.4), 0.5);
  d = smin(d, sdSphere(p, c4, 0.36), 0.5);
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

void main() {
  // Normalised by width, not height: this canvas is a tall, narrow strip
  // (a panel down the right side of the hero, not a landscape box), so
  // width-based framing keeps the horizontal field of view consistent and
  // simply reveals more of the scene vertically, rather than cropping the
  // cluster into a thin sliver the way height-based framing would here.
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.x;
  vec3 ro = vec3(0.0, 0.0, 3.9);
  vec3 rd = normalize(vec3(uv, -1.4));

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 48; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.0018) { hit = true; break; }
    t += d;
    if (t > 7.5) break;
  }

  if (!hit) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  vec3 lightA = normalize(vec3(0.6, 0.75, 0.55));
  vec3 lightB = normalize(vec3(-0.55, -0.25, 0.4));
  float diffA = max(dot(n, lightA), 0.0);
  float diffB = max(dot(n, lightB), 0.0);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.4);

  vec3 base = vec3(0.055, 0.07, 0.11);
  vec3 gold = vec3(0.929, 0.702, 0.345);
  vec3 sky = vec3(0.49, 0.608, 0.839);

  vec3 col = base;
  col += gold * diffA * 0.55;
  col += sky * diffB * 0.3;
  col += gold * fres * 0.85;

  float alpha = 0.82 + fres * 0.18;
  gl_FragColor = vec4(col, alpha);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The liquid blob behind the hero: a handful of raymarched, merged spheres
 * with a glossy rim light, the "3D, alive" centrepiece the page was missing.
 *
 * Deliberately not three.js: for one fullscreen shader, a raw WebGL context
 * with a two-triangle draw call is both smaller and cheaper than pulling in a
 * scene graph. Internal render resolution is capped well below the display
 * size (raymarching cost scales with pixel count), the whole thing pauses
 * off-screen or when the tab is hidden, and it renders nothing at all if
 * WebGL isn't available rather than breaking the page.
 */
export default function LiquidBlobScene({ reduced = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    mount.appendChild(canvas);

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) {
      mount.removeChild(canvas);
      return undefined;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return undefined;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // One triangle, big enough to cover the whole clip-space square.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uPointerStrength = gl.getUniformLocation(program, "uPointerStrength");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Internal resolution capped well under the display size: raymarch cost
    // is per-pixel, so this is the single biggest lever on GPU cost.
    const MAX_INTERNAL_WIDTH = 720;

    let cssWidth = 0;
    let cssHeight = 0;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      const scale = Math.min(1, MAX_INTERNAL_WIDTH / cssWidth);
      canvas.width = Math.round(cssWidth * scale);
      canvas.height = Math.round(cssHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0, active: 0 };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointerTarget.active = inside ? 1 : 0;
      if (inside) {
        pointerTarget.x = (x / rect.width) * 2 - 1;
        pointerTarget.y = -((y / rect.height) * 2 - 1);
      }
    };
    const onLeave = () => {
      pointerTarget.active = 0;
    };
    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("blur", onLeave);
    }

    let frame = 0;
    let running = false;
    let onScreen = true;
    let startTime = performance.now();
    let strength = 0;

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;
      pointer.x += (pointerTarget.x - pointer.x) * 0.06;
      pointer.y += (pointerTarget.y - pointer.y) * 0.06;
      strength += (pointerTarget.active - strength) * 0.06;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPointerStrength, strength);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (time) => {
      render(time);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    if (reduced) render(performance.now());

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) start();
      else stop();
    });
    visibility.observe(mount);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [reduced]);

  return <div ref={mountRef} className="h-full w-full" />;
}
