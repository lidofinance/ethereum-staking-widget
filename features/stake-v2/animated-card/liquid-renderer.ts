// Framework-free WebGL1 renderer for the card's liquid blob.
// Draws in the Figma artwork's own box (BLOB_BOX), so the canvas can
// replace the SVG fallback 1:1 in the same slot.
//
// Everything that grows with time (ball orbits, noise scroll) is computed
// on the CPU in doubles and handed over small and wrapped, so the shader
// stays correct where `mediump` is real half precision (most mobile GPUs).

import {
  LOWEST_LEVEL,
  QUALITY_LEVELS,
  type PerfLevel,
  type QualityLevel,
} from './liquid-perf';
import type { LiquidParams } from './liquid-params';
import { NOISE_PERIOD, NOISE_SIZE, getNoiseTexels } from './noise-texture';
import { createPerfMonitor, type PerfStats } from './perf-monitor';

export const BLOB_BOX = { width: 915.836, height: 474 } as const;

// y of the top band: `scaleY` stretches the layout below it, so the band
// stays put and the tendrils reach further down
export const BLOB_BAND_Y = 120;

/** blob y position (px) once the layout is stretched by `scaleY` */
export const stretchBlobY = (y: number, scaleY: number) =>
  BLOB_BAND_Y + (y - BLOB_BAND_Y) * scaleY;

export type RGB = readonly [number, number, number];

export type BlobPalette = {
  // gradient stops of the Figma blob, top -> bottom
  from: RGB;
  to: RGB;
};

export type LiquidFailure =
  | 'no hardware WebGL'
  | 'known slow GPU'
  | 'shader link failed'
  | 'context lost';

export type LiquidRenderer = {
  setPalette: (palette: BlobPalette) => void;
  setParams: (params: LiquidParams) => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
  gpu: string | null;
};

export type LiquidRendererOptions = {
  palette: BlobPalette;
  params: LiquidParams;
  /** level to start from, e.g. the one this browser settled on before */
  level: QualityLevel;
  /** forced shader: no software/slow GPU screening, never steps to svg */
  strict: boolean;
  /** first frames are on screen: safe to fade the canvas in */
  onReady: () => void;
  onError: (failure: LiquidFailure) => void;
  /** quality changed; `svg` means the device cannot keep up at all */
  onLevelChange: (level: PerfLevel) => void;
  onStats: (stats: PerfStats) => void;
};

export type CreateLiquidRendererResult =
  | { renderer: LiquidRenderer; failure?: never }
  | { renderer?: never; failure: LiquidFailure };

// frames drawn before onReady, so the first paint and any driver warm-up
// stall happen while the canvas is still transparent
const WARMUP_FRAMES = 2;
// cap on one frame's time step, so a hitch or a resume after the card was
// off-screen never makes the blob jump
const MAX_FRAME_STEP_S = 0.1;
// edge half-width, in field units, when blur is off
const HARD_EDGE = 0.01;
// frames ignored after a quality change while the new size settles
const LEVEL_SETTLE_MS = 1000;
// GTA mode: seconds per full red/blue swap, and the px width of the
// blend between the two halves
const SIREN_PERIOD_S = 0.8;
const SIREN_BLEND_PX = 120;

// GPUs that cannot run the shader at a usable rate
const SLOW_GPU =
  /swiftshader|llvmpipe|basic render|mali-4|mali-t6|adreno \(tm\) 3|powervr sgx/i;

// x, y, radius, orbit phase, tendril weight (0 = part of the top band)
const BALLS = [
  [300, 125, 92, 0, 0],
  [425, 118, 92, 1.7, 0],
  [545, 118, 90, 3.1, 0],
  [655, 135, 80, 4.6, 0],
  [185, 235, 52, 2.2, 0.45],
  [135, 315, 40, 5.3, 0.3],
  [445, 235, 46, 0.9, 0.45],
  [565, 235, 46, 3.8, 0.45],
  [690, 250, 48, 6.1, 0.5],
  [765, 320, 42, 2.9, 0.4],
] as const;

// Figma gradient axis, stretched with the layout and pre-divided by its
// squared length so the shader never squares a large number
const getGradient = (scaleY: number) => {
  const from = [643, stretchBlobY(111.4, scaleY)] as const;
  const x = 609.8 - from[0];
  const y = stretchBlobY(395.2, scaleY) - from[1];
  const lengthSq = x * x + y * y;
  return { from, axis: [x / lengthSq, y / lengthSq] as const };
};

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
// tendrils hanging down), domain-warped by baked fbm noise so the outline
// flows like gas. Colour follows the Figma linear gradient axis.
const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uSize;
uniform vec3 uFrom;
uniform vec3 uTo;
uniform float uIntensity;
// x: edge level, y: half-width of the soft edge
uniform vec2 uThreshold;
// x: amount (px), y: feature scale (px)
uniform vec2 uWarp;
// xy, zw: scroll of the two noise lookups, in noise units, wrapped
uniform vec4 uNoiseOffset;
uniform float uEdgeFade;
uniform vec2 uGradientFrom;
uniform vec2 uGradientAxis;
// GTA mode. x: on (0 / 1), y: which half is red, -1 (left) .. 1 (right)
uniform vec2 uSiren;
// xy: centre (px), z: radius (px), w: weight
uniform vec4 uBalls[${BALLS.length}];
uniform sampler2D uNoise;
varying vec2 vUv;

const float NOISE_PERIOD = ${NOISE_PERIOD.toFixed(1)};

float fbm(vec2 p) {
  return texture2D(uNoise, p / NOISE_PERIOD).r;
}

void main() {
  vec2 base = vUv * uSize;

  vec2 q = base / uWarp.y;
  vec2 warp = vec2(
    fbm(q + uNoiseOffset.xy),
    fbm(q + uNoiseOffset.zw)
  ) - 0.5;
  vec2 p = base + warp * uWarp.x;

  float d = 0.0;
  for (int i = 0; i < ${BALLS.length}; i++) {
    vec4 ball = uBalls[i];
    vec2 offset = (p - ball.xy) / ball.z;
    d += ball.w * exp(-dot(offset, offset));
  }

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

  float k = clamp(dot(base - uGradientFrom, uGradientAxis), 0.0, 1.0);
  vec3 color = mix(uFrom, uTo, k);

  // police lights: one half red, the other blue, swapping sides
  float side = clamp((base.x - uSize.x * 0.5) / ${SIREN_BLEND_PX.toFixed(1)}, -1.0, 1.0);
  vec3 siren = mix(
    vec3(0.05, 0.3, 1.0),
    vec3(1.0, 0.08, 0.12),
    side * uSiren.y * 0.5 + 0.5
  );
  color = mix(color, siren, uSiren.x);

  gl_FragColor = vec4(color * alpha, alpha);
}
`;

const wrapNoise = (value: number) =>
  ((value % NOISE_PERIOD) + NOISE_PERIOD) % NOISE_PERIOD;

const readGpuName = (gl: WebGLRenderingContext) => {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name: unknown = gl.getParameter(
    info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER,
  );
  return typeof name === 'string' ? name : null;
};

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

const uploadNoise = (gl: WebGLRenderingContext) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    NOISE_SIZE,
    NOISE_SIZE,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    getNoiseTexels(),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
};

export const createLiquidRenderer = (
  canvas: HTMLCanvasElement,
  options: LiquidRendererOptions,
): CreateLiquidRendererResult => {
  const { strict, onReady, onError, onLevelChange, onStats } = options;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    // software rendering (no GPU, blocklisted driver) gets no context, so
    // it never burns CPU on the shader; a forced shader still tries
    failIfMajorPerformanceCaveat: !strict,
  });
  if (!gl) return { failure: 'no hardware WebGL' };

  const gpu = readGpuName(gl);
  if (!strict && gpu && SLOW_GPU.test(gpu)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { failure: 'known slow GPU' };
  }

  const parallelCompile = gl.getExtension('KHR_parallel_shader_compile');
  const program = startProgram(gl);
  if (!program) return { failure: 'no hardware WebGL' };

  let state: 'linking' | 'ready' | 'failed' = 'linking';
  let palette = options.palette;
  let params = options.params;
  let level: QualityLevel = options.level;
  const monitor = createPerfMonitor(0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  let uniforms: Record<
    | 'from'
    | 'to'
    | 'intensity'
    | 'threshold'
    | 'warp'
    | 'noiseOffset'
    | 'edgeFade'
    | 'size'
    | 'gradientFrom'
    | 'gradientAxis'
    | 'siren'
    | 'balls',
    WebGLUniformLocation | null
  > | null = null;
  const ballData = new Float32Array(BALLS.length * 4);

  const pinnedLevel = (): QualityLevel | null => {
    const index = QUALITY_LEVELS.findIndex(
      ({ name }) => name === params.quality,
    );
    return index === -1 ? null : (index as QualityLevel);
  };

  const applyLevel = () => {
    const { resolutionScale, fpsCap } = QUALITY_LEVELS[level];
    const scale = params.resolution * resolutionScale;
    const width = Math.max(1, Math.round(BLOB_BOX.width * scale));
    const blobHeight = stretchBlobY(BLOB_BOX.height, params.scaleY);
    const height = Math.max(1, Math.round(blobHeight * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    const userCap = params.maxFps > 0 ? params.maxFps : Infinity;
    monitor.setFpsCap(Math.min(userCap, fpsCap));
  };

  const applyPalette = () => {
    if (!uniforms) return;
    const { from, to } = palette;
    gl.uniform3f(uniforms.from, from[0], from[1], from[2]);
    gl.uniform3f(uniforms.to, to[0], to[1], to[2]);
  };

  const applyParams = () => {
    applyLevel();
    if (!uniforms) return;
    gl.uniform1f(uniforms.intensity, params.intensity);
    // blur off: a near-hard edge (a hair of width to avoid stair-stepping)
    const softness = params.blur
      ? Math.max(params.softness, HARD_EDGE)
      : HARD_EDGE;
    gl.uniform2f(uniforms.threshold, params.threshold, softness);
    gl.uniform2f(
      uniforms.warp,
      params.warpAmount,
      Math.max(params.warpScale, 1),
    );
    gl.uniform1f(uniforms.edgeFade, Math.max(params.edgeFade, 0.001));
    // only the layout stretches: ball radii and noise keep their px size,
    // so the motion looks the same in a taller box
    gl.uniform2f(
      uniforms.size,
      BLOB_BOX.width,
      stretchBlobY(BLOB_BOX.height, params.scaleY),
    );
    const gradient = getGradient(params.scaleY);
    gl.uniform2f(uniforms.gradientFrom, ...gradient.from);
    gl.uniform2f(uniforms.gradientAxis, ...gradient.axis);
  };

  // one triangle covering the viewport
  const buffer = gl.createBuffer();
  let noiseTexture: WebGLTexture | null = null;

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

    noiseTexture = uploadNoise(gl);
    gl.uniform1i(uniform('uNoise'), 0);
    uniforms = {
      from: uniform('uFrom'),
      to: uniform('uTo'),
      intensity: uniform('uIntensity'),
      threshold: uniform('uThreshold'),
      warp: uniform('uWarp'),
      noiseOffset: uniform('uNoiseOffset'),
      edgeFade: uniform('uEdgeFade'),
      size: uniform('uSize'),
      gradientFrom: uniform('uGradientFrom'),
      gradientAxis: uniform('uGradientAxis'),
      siren: uniform('uSiren'),
      balls: uniform('uBalls[0]'),
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

  const advance = (now: number) => {
    const step =
      lastNow === null ? 0 : Math.min((now - lastNow) / 1000, MAX_FRAME_STEP_S);
    lastNow = now;
    bootTime += step;
    // speed eases from 0 to 1, so the blob starts still and picks up pace
    // instead of jumping into motion
    const ramp =
      params.speedRamp > 0 ? 1 - Math.exp(-bootTime / params.speedRamp) : 1;
    shaderTime += step * params.speed * ramp;
  };

  const draw = () => {
    if (!uniforms) return;
    const t = shaderTime;

    BALLS.forEach(([x, y, radius, phase, tendril], index) => {
      const local = t + phase;
      const orbit = radius * params.drift;
      ballData[index * 4] = x + Math.sin(local * 0.61) * orbit;
      ballData[index * 4 + 1] =
        stretchBlobY(y, params.scaleY) + Math.cos(local * 0.47) * orbit;
      ballData[index * 4 + 2] = radius * (1 + 0.08 * Math.sin(local * 0.83));
      ballData[index * 4 + 3] = tendril === 0 ? 1 : tendril * params.tendrils;
    });
    gl.uniform4fv(uniforms.balls, ballData);
    // real time, not shader time: the lights flash even at speed 0.
    // A clamped sine is a square wave with short cross-fades.
    const swap = Math.sin((bootTime * 2 * Math.PI) / SIREN_PERIOD_S) * 6;
    gl.uniform2f(
      uniforms.siren,
      params.gtaMode ? 1 : 0,
      Math.max(-1, Math.min(1, swap)),
    );
    gl.uniform4f(
      uniforms.noiseOffset,
      0,
      wrapNoise(t * 0.09),
      wrapNoise(5.2 - t * 0.07),
      wrapNoise(1.3 - t * 0.07),
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const stepDown = (now: number) => {
    if (level < LOWEST_LEVEL) {
      level = (level + 1) as QualityLevel;
      applyLevel();
      monitor.settle(now, LEVEL_SETTLE_MS);
      onLevelChange(level);
    } else if (!strict) {
      onLevelChange('svg');
    }
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
        onError('shader link failed');
        return;
      }
      state = 'ready';
    }

    if (monitor.tick(now)) {
      advance(now);
      draw();
      if (framesDrawn < WARMUP_FRAMES && ++framesDrawn === WARMUP_FRAMES) {
        onReady();
      }
      const verdict = monitor.drawn(now);
      const stats = monitor.getStats();
      if (verdict && stats) onStats(stats);
      if (verdict === 'degrade' && pinnedLevel() === null) stepDown(now);
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

  const pinned = pinnedLevel();
  if (pinned !== null) level = pinned;
  applyLevel();

  return {
    renderer: {
      gpu,
      setPalette: (next) => {
        palette = next;
        applyPalette();
        repaintIfPaused();
      },
      setParams: (next) => {
        params = next;
        const nextPinned = pinnedLevel();
        if (nextPinned !== null && nextPinned !== level) {
          level = nextPinned;
          onLevelChange(level);
        }
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
        gl.deleteTexture(noiseTexture);
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      },
    },
  };
};
