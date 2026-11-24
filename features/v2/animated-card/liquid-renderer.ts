// Framework-free WebGL1 renderer for the card's liquid blob.
// Draws in the Figma artwork's own box (BLOB_BOX), so the canvas can
// replace the SVG fallback 1:1 in the same slot.

import type { LiquidParams } from './liquid-params';

export const BLOB_BOX = { width: 915.836, height: 474 } as const;

export type RGB = readonly [number, number, number];

export type BlobPalette = {
  // gradient stops of the Figma blob, top -> bottom
  from: RGB;
  to: RGB;
};

export type LiquidRenderer = {
  setPalette: (palette: BlobPalette) => void;
  setParams: (params: LiquidParams) => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

export type LiquidRendererOptions = {
  palette: BlobPalette;
  params: LiquidParams;
  /** first frames are on screen: safe to fade the canvas in */
  onReady: () => void;
  /** the shader failed to link: use the fallback */
  onError: () => void;
};

// frames drawn before onReady, so the first paint and any driver warm-up
// stall happen while the canvas is still transparent
const WARMUP_FRAMES = 2;
// cap on one frame's time step, so a hitch or a resume after the card was
// off-screen never makes the blob jump
const MAX_FRAME_STEP_S = 0.1;
// edge half-width, in field units, when blur is off
const HARD_EDGE = 0.01;

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  // y flipped so vUv matches SVG space (origin top-left)
  vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Soft gaussian "metaballs" laid along the Figma shape (a top band with
// tendrils hanging down), drifting on their own slow orbits, then
// domain-warped by fbm noise so the outline flows like gas. Colour follows
// the Figma linear gradient axis.
const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uSize;
uniform float uTime;
uniform vec3 uFrom;
uniform vec3 uTo;
uniform float uIntensity;
// x: edge level, y: half-width of the soft edge
uniform vec2 uThreshold;
// x: amount (px), y: feature scale (px)
uniform vec2 uWarp;
uniform float uTendrils;
uniform float uDrift;
uniform float uEdgeFade;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

float ball(vec2 p, vec2 center, float radius, float phase) {
  float t = uTime + phase;
  center += vec2(sin(t * 0.61), cos(t * 0.47)) * radius * uDrift;
  radius *= 1.0 + 0.08 * sin(t * 0.83);
  vec2 d = (p - center) / radius;
  return exp(-dot(d, d));
}

void main() {
  vec2 base = vUv * uSize;
  float t = uTime;

  vec2 q = base / uWarp.y;
  vec2 warp = vec2(
    fbm(q + vec2(0.0, t * 0.09)),
    fbm(q + vec2(5.2, 1.3) - t * 0.07)
  ) - 0.5;
  vec2 p = base + warp * uWarp.x;

  float d = 0.0;
  // top band
  d += ball(p, vec2(300.0, 125.0), 92.0, 0.0);
  d += ball(p, vec2(425.0, 118.0), 92.0, 1.7);
  d += ball(p, vec2(545.0, 118.0), 90.0, 3.1);
  d += ball(p, vec2(655.0, 135.0), 80.0, 4.6);
  // tendrils
  float tendrils = 0.0;
  tendrils += 0.45 * ball(p, vec2(185.0, 235.0), 52.0, 2.2);
  tendrils += 0.30 * ball(p, vec2(135.0, 315.0), 40.0, 5.3);
  tendrils += 0.45 * ball(p, vec2(445.0, 235.0), 46.0, 0.9);
  tendrils += 0.45 * ball(p, vec2(565.0, 235.0), 46.0, 3.8);
  tendrils += 0.50 * ball(p, vec2(690.0, 250.0), 48.0, 6.1);
  tendrils += 0.40 * ball(p, vec2(765.0, 320.0), 42.0, 2.9);
  d += uTendrils * tendrils;

  // the Figma blob is a thin shape under a 40px blur, so it reads as a
  // translucent haze: cap the peak opacity instead of going solid
  float alpha = uIntensity * smoothstep(
    uThreshold.x - uThreshold.y,
    uThreshold.x + uThreshold.y,
    d
  );

  // fade out before the canvas edge so the drift never shows a hard cut
  float edge = min(min(base.x, uSize.x - base.x), min(base.y, uSize.y - base.y));
  alpha *= smoothstep(0.0, uEdgeFade, edge);

  vec2 g0 = vec2(643.0, 111.4);
  vec2 g1 = vec2(609.8, 395.2);
  vec2 axis = g1 - g0;
  float k = clamp(dot(base - g0, axis) / dot(axis, axis), 0.0, 1.0);
  vec3 color = mix(uFrom, uTo, k);

  gl_FragColor = vec4(color * alpha, alpha);
}
`;

// No status checks here: with KHR_parallel_shader_compile the driver
// compiles off the main thread, and asking for COMPILE/LINK_STATUS right
// away would block until it is done. The render loop polls instead.
const startProgram = (gl: WebGLRenderingContext) => {
  const program = gl.createProgram();
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vertex || !fragment) return null;

  gl.shaderSource(vertex, VERTEX_SHADER);
  gl.shaderSource(fragment, FRAGMENT_SHADER);
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // flagged for deletion, freed together with the program
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
};

/** `null` when WebGL is unavailable: use the fallback */
export const createLiquidRenderer = (
  canvas: HTMLCanvasElement,
  { palette, params, onReady, onError }: LiquidRendererOptions,
): LiquidRenderer | null => {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const parallelCompile = gl.getExtension('KHR_parallel_shader_compile');
  const program = startProgram(gl);
  if (!program) return null;

  let state: 'linking' | 'ready' | 'failed' = 'linking';
  let currentPalette = palette;
  let currentParams = params;
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  let uniforms: Record<
    | 'time'
    | 'from'
    | 'to'
    | 'intensity'
    | 'threshold'
    | 'warp'
    | 'tendrils'
    | 'drift'
    | 'edgeFade',
    WebGLUniformLocation | null
  > | null = null;

  const resize = () => {
    const width = Math.round(BLOB_BOX.width * currentParams.resolution);
    const height = Math.round(BLOB_BOX.height * currentParams.resolution);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };
  resize();

  const applyPalette = () => {
    if (!uniforms) return;
    const { from, to } = currentPalette;
    gl.uniform3f(uniforms.from, from[0], from[1], from[2]);
    gl.uniform3f(uniforms.to, to[0], to[1], to[2]);
  };

  const applyParams = () => {
    resize();
    if (!uniforms) return;
    const p = currentParams;
    gl.uniform1f(uniforms.intensity, p.intensity);
    // blur off: a near-hard edge (a hair of width to avoid stair-stepping)
    const softness = p.blur ? Math.max(p.softness, HARD_EDGE) : HARD_EDGE;
    gl.uniform2f(uniforms.threshold, p.threshold, softness);
    gl.uniform2f(uniforms.warp, p.warpAmount, Math.max(p.warpScale, 1));
    gl.uniform1f(uniforms.tendrils, p.tendrils);
    gl.uniform1f(uniforms.drift, p.drift);
    gl.uniform1f(uniforms.edgeFade, Math.max(p.edgeFade, 0.001));
  };

  // one triangle covering the viewport
  const buffer = gl.createBuffer();

  const finishSetup = () => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uniform('uSize'), BLOB_BOX.width, BLOB_BOX.height);
    uniforms = {
      time: uniform('uTime'),
      from: uniform('uFrom'),
      to: uniform('uTo'),
      intensity: uniform('uIntensity'),
      threshold: uniform('uThreshold'),
      warp: uniform('uWarp'),
      tendrils: uniform('uTendrils'),
      drift: uniform('uDrift'),
      edgeFade: uniform('uEdgeFade'),
    };
    applyPalette();
    applyParams();
    return true;
  };

  // Shader time is integrated frame by frame, so speed can change live
  // without the blob jumping. Random start so cards mounted together do
  // not move in lockstep.
  let shaderTime = Math.random() * 100;
  let bootTime = 0;
  let lastNow: number | null = null;
  let framesDrawn = 0;
  let frame: number | null = null;

  const draw = () => {
    gl.uniform1f(uniforms?.time ?? null, shaderTime);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const advance = (now: number) => {
    const step =
      lastNow === null ? 0 : Math.min((now - lastNow) / 1000, MAX_FRAME_STEP_S);
    lastNow = now;
    bootTime += step;
    // speed eases from 0 to 1, so the blob starts still and picks up pace
    // instead of jumping into motion
    const { speed, speedRamp } = currentParams;
    const ramp = speedRamp > 0 ? 1 - Math.exp(-bootTime / speedRamp) : 1;
    shaderTime += step * speed * ramp;
  };

  const loop = (now: number) => {
    frame = null;

    if (state === 'linking') {
      const isDone =
        !parallelCompile ||
        gl.getProgramParameter(program, parallelCompile.COMPLETION_STATUS_KHR);
      if (!isDone) {
        frame = requestAnimationFrame(loop);
        return;
      }
      if (!finishSetup()) {
        state = 'failed';
        onError();
        return;
      }
      state = 'ready';
    }

    advance(now);
    draw();
    if (framesDrawn < WARMUP_FRAMES && ++framesDrawn === WARMUP_FRAMES) {
      onReady();
    }
    frame = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastNow = null;
  };

  // repaint right away when paused, e.g. a theme switch off-screen
  const repaintIfPaused = () => {
    if (state === 'ready' && frame === null) draw();
  };

  return {
    setPalette: (next) => {
      currentPalette = next;
      applyPalette();
      repaintIfPaused();
    },
    setParams: (next) => {
      currentParams = next;
      applyParams();
      repaintIfPaused();
    },
    start: () => {
      if (frame === null && state !== 'failed') {
        frame = requestAnimationFrame(loop);
      }
    },
    stop,
    destroy: () => {
      stop();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
};
