import { useEffect, useRef, type FC } from 'react';
import styled from 'styled-components';

import {
  PILE_COL,
  PILE_SHAPES,
  clearPile,
  createPile,
  depositOnPile,
  getPileCellCount,
  isPileKind,
  prefillPile,
  relaxPile,
  sweepPile,
  type SnowPile,
  type SnowPileKind,
  type SweptCell,
} from './snow-model';
import { useAnimationFrame } from './use-animation-frame';
import { useWinterTheme } from './winter-theme-context';

// Elements opt in with data-snow-surface="card" | "block" | "button"
export const SNOW_SURFACE_ATTR = 'data-snow-surface';

// above page content, below the mobile navigation, modals and toasts
export const SNOW_Z_INDEX = 5;

// Falling flakes and knocked-off snow live in viewport space
const FlakeCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${SNOW_Z_INDEX};
  pointer-events: none;
`;

// Drifts live in document space: each one is a small canvas placed on its
// card, so it scrolls with the card instead of chasing it
const DriftLayer = styled.div`
  position: absolute;
  z-index: ${SNOW_Z_INDEX};
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  pointer-events: none;

  canvas {
    position: absolute;
    pointer-events: none;
  }
`;

// room above the drift for its shadow, and below the card edge
const DRIFT_PAD_TOP = 12;
const DRIFT_PAD_BOTTOM = 6;
const DRIFT_PAD_X = 6;

type Flake = {
  x: number;
  y: number;
  r: number;
  vy: number;
  phase: number;
  sway: number;
  near: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
};

type Drift = {
  el: HTMLElement;
  kind: SnowPileKind;
  pile: SnowPile;
  canvas: HTMLCanvasElement;
  // viewport position of the pile base, refreshed every frame
  x: number;
  y: number;
  w: number;
  // last placement inside the layer, to skip redundant style writes
  placed: string;
};

type Palette = {
  flake: string;
  flakeShadow: string;
  snow: string;
  driftBottom: string;
  driftShadow: string;
};

const readPalette = (): Palette => {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    css.getPropertyValue(name).trim() || fallback;
  return {
    flake: v('--winter-flake', '#fff'),
    flakeShadow: v('--winter-flake-shadow', 'rgba(0,0,0,0)'),
    snow: v('--winter-snow', '#fff'),
    driftBottom: v('--winter-drift-bottom', '#eef3fa'),
    driftShadow: v('--winter-drift-shadow', 'rgba(0,0,0,0.2)'),
  };
};

const spawnFlake = (W: number, H: number, anywhere: boolean): Flake => {
  const layer = Math.random();
  const near = layer > 0.94;
  const r = near
    ? 2.4 + Math.random() * 0.9
    : layer > 0.6
      ? 1.6 + Math.random() * 1.2
      : 0.8 + Math.random() * 0.8;
  return {
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : -10,
    r,
    vy: 0.3 + r * 0.32,
    phase: Math.random() * Math.PI * 2,
    sway: 0.25 + Math.random() * 0.6,
    near,
  };
};

const MAX_PARTICLES = 500;
const DISCOVER_EVERY_MS = 250;
const PALETTE_EVERY_MS = 500;

const getDpr = () => Math.min(2, window.devicePixelRatio || 1);

class SnowScene {
  flakes: Flake[] = [];
  particles: Particle[] = [];
  drifts: Drift[] = [];
  pointer = { x: -9999, y: -9999 };
  palette: Palette | null = null;
  discoveredAt = 0;
  paletteAt = 0;

  // Which elements carry a drift. Cheap enough to run a few times a second.
  discover(layer: HTMLElement) {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(`[${SNOW_SURFACE_ATTR}]`),
    );
    const rects = nodes.map((el) => el.getBoundingClientRect());
    const keep: Drift[] = [];

    nodes.forEach((el, i) => {
      const kind = el.getAttribute(SNOW_SURFACE_ATTR);
      const rect = rects[i];
      if (!isPileKind(kind) || !rect.width || !rect.height) return;
      // another surface lies on top of this edge (wallet card over the form)
      const cx = rect.left + rect.width / 2;
      const covered = rects.some(
        (r, k) =>
          k !== i &&
          cx > r.left &&
          cx < r.right &&
          rect.top - 2 > r.top &&
          rect.top - 2 < r.bottom,
      );
      if (covered) return;
      // a disabled button would look like part of the decor
      if (kind === 'button' && el.matches(':disabled')) return;

      const width = rect.width - PILE_SHAPES[kind].inset * 2;
      if (width < 24) return;

      let drift = this.drifts.find((d) => d.el === el);
      if (!drift || drift.pile.n !== getPileCellCount(width)) {
        const pile = createPile(width, kind);
        prefillPile(pile);
        const canvas = drift?.canvas ?? document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        if (!canvas.parentElement) layer.appendChild(canvas);
        drift = { el, kind, pile, canvas, x: 0, y: 0, w: width, placed: '' };
      }
      keep.push(drift);
    });

    for (const d of this.drifts) {
      if (!keep.includes(d)) d.canvas.remove();
    }
    this.drifts = keep;
  }

  // Track the cards every frame: the flakes need viewport coordinates,
  // the drift canvases need their place in the layer
  place(layer: HTMLElement) {
    const origin = layer.getBoundingClientRect();
    const dpr = getDpr();
    for (const d of this.drifts) {
      const rect = d.el.getBoundingClientRect();
      const { inset, max } = PILE_SHAPES[d.kind];
      d.x = rect.left + inset;
      d.y = rect.top;
      d.w = d.pile.n * PILE_COL;

      const cw = d.w + DRIFT_PAD_X * 2;
      const ch = max + DRIFT_PAD_TOP + DRIFT_PAD_BOTTOM;
      const left = Math.round(d.x - origin.left - DRIFT_PAD_X);
      const top = Math.round(d.y - origin.top - max - DRIFT_PAD_TOP);
      const key = `${left}:${top}:${cw}:${ch}:${dpr}`;
      if (key === d.placed) continue;
      d.placed = key;
      d.canvas.width = Math.round(cw * dpr);
      d.canvas.height = Math.round(ch * dpr);
      d.canvas.style.width = `${cw}px`;
      d.canvas.style.height = `${ch}px`;
      d.canvas.style.left = `${left}px`;
      d.canvas.style.top = `${top}px`;
    }
  }

  emit(d: Drift, cells: SweptCell[], vx: number, vy: number) {
    for (const { j, amount } of cells) {
      if (this.particles.length >= MAX_PARTICLES) return;
      if (Math.random() > amount / 3) continue;
      this.particles.push({
        x: d.x + j * PILE_COL + PILE_COL / 2,
        y: d.y - d.pile.h[j] + Math.random() * 4,
        vx: vx * 0.25 + (Math.random() - 0.5) * 1.5,
        vy: -0.8 - Math.random() * 2 + vy * 0.1,
        r: 1 + Math.random() * 2,
        life: 60 + Math.random() * 30,
      });
    }
  }

  onPointerMove(x: number, y: number) {
    const { pointer } = this;
    const vx = pointer.x > -9000 ? x - pointer.x : 0;
    const vy = pointer.y > -9000 ? y - pointer.y : 0;
    pointer.x = x;
    pointer.y = y;
    const speed = Math.min(40, Math.hypot(vx, vy));
    for (const d of this.drifts) {
      if (x < d.x - 16 || x > d.x + d.w + 16) continue;
      this.emit(d, sweepPile(d.pile, x - d.x, y, d.y, speed), vx, vy);
    }
  }

  onClick(x: number, y: number) {
    for (const d of this.drifts) {
      const hit =
        x >= d.x && x <= d.x + d.w && y >= d.y - d.pile.max - 6 && y <= d.y + 4;
      if (hit) this.emit(d, clearPile(d.pile), 0, 0);
    }
  }

  frame(
    canvas: HTMLCanvasElement,
    layer: HTMLElement,
    time: number,
    dt: number,
    falling: boolean,
  ) {
    if (time - this.discoveredAt > DISCOVER_EVERY_MS) {
      this.discover(layer);
      this.discoveredAt = time;
    }
    if (!this.palette || time - this.paletteAt > PALETTE_EVERY_MS) {
      this.palette = readPalette();
      this.paletteAt = time;
    }
    this.place(layer);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = getDpr();
    if (
      canvas.width !== Math.round(W * dpr) ||
      canvas.height !== Math.round(H * dpr)
    ) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const palette = this.palette;
    this.drawFlakes(ctx, W, H, dt, falling, palette);
    this.drawParticles(ctx, dt, palette);
    for (const d of this.drifts) {
      relaxPile(d.pile);
      this.drawDrift(d, palette, dpr);
    }
  }

  drawFlakes(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    dt: number,
    falling: boolean,
    palette: Palette,
  ) {
    const { flakes, pointer } = this;
    const target = falling ? Math.round(Math.min(260, (W * H) / 8000)) : 0;
    while (flakes.length < target) flakes.push(spawnFlake(W, H, true));
    if (flakes.length > target) flakes.length = target;

    ctx.fillStyle = palette.flake;
    ctx.shadowColor = palette.flakeShadow;
    ctx.shadowBlur = 2;

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.phase += 0.02 * dt;
      let vx = Math.sin(f.phase) * f.sway * 0.5;
      // the cursor blows flakes away
      const dx = f.x - pointer.x;
      const dy = f.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 6400) {
        const d = Math.sqrt(d2) || 1;
        const push = (1 - d / 80) * 3.2;
        vx += (dx / d) * push;
        f.y += (dy / d) * push * 0.5 * dt;
      }
      f.x += vx * dt;
      f.y += f.vy * dt;

      let landed = false;
      if (!f.near) {
        for (const drift of this.drifts) {
          if (f.x < drift.x || f.x > drift.x + drift.w) continue;
          const { pile } = drift;
          const j = Math.min(
            pile.n - 1,
            Math.max(0, Math.floor((f.x - drift.x) / PILE_COL)),
          );
          if (f.y >= drift.y - pile.h[j] && f.y <= drift.y + 6) {
            depositOnPile(pile, j);
            landed = true;
            break;
          }
        }
      }
      if (landed || f.y > H + 12 || f.x < -20 || f.x > W + 20) {
        flakes[i] = spawnFlake(W, H, false);
        continue;
      }
      ctx.globalAlpha = f.near ? 0.85 : 0.92;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  drawParticles(ctx: CanvasRenderingContext2D, dt: number, palette: Palette) {
    const { particles } = this;
    ctx.fillStyle = palette.snow;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.12 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, p.life / 30);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // in the drift canvas' own coordinates: the card edge is `base`
  drawDrift(d: Drift, palette: Palette, dpr: number) {
    const ctx = d.canvas.getContext('2d');
    if (!ctx) return;
    const { pile } = d;
    const base = pile.max + DRIFT_PAD_TOP;
    const x0 = DRIFT_PAD_X;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, d.canvas.width, d.canvas.height);

    ctx.beginPath();
    ctx.moveTo(x0 - 2, base + 1.5);
    let px = x0 + PILE_COL / 2;
    let py = base + 1 - pile.h[0];
    ctx.lineTo(px, py);
    for (let j = 1; j < pile.n; j++) {
      const x = x0 + j * PILE_COL + PILE_COL / 2;
      const y = base + 1 - pile.h[j];
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x;
      py = y;
    }
    ctx.lineTo(x0 + d.w + 2, base + 1.5);
    ctx.closePath();

    ctx.save();
    ctx.shadowColor = palette.driftShadow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    const g = ctx.createLinearGradient(0, base - pile.max, 0, base + 2);
    g.addColorStop(0, palette.snow);
    g.addColorStop(1, palette.driftBottom);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  dispose() {
    for (const d of this.drifts) d.canvas.remove();
    this.drifts = [];
  }
}

export const SnowCanvas: FC = () => {
  const { snow, reducedMotion } = useWinterTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SnowScene | null>(null);
  if (!sceneRef.current) sceneRef.current = new SnowScene();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const onMove = (e: PointerEvent) =>
      scene.onPointerMove(e.clientX, e.clientY);
    const onLeave = () => {
      scene.pointer.x = -9999;
      scene.pointer.y = -9999;
    };
    const onClick = (e: MouseEvent) => scene.onClick(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('click', onClick, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('click', onClick);
      scene.dispose();
    };
  }, []);

  useAnimationFrame((time, dt) => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const scene = sceneRef.current;
    if (!canvas || !layer || !scene) return;
    scene.frame(canvas, layer, time, dt, snow && !reducedMotion);
  }, true);

  return (
    <>
      <DriftLayer ref={layerRef} aria-hidden="true" data-winter="drifts" />
      <FlakeCanvas ref={canvasRef} aria-hidden="true" data-winter="snow" />
    </>
  );
};
