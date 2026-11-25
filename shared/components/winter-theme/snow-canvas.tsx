import { useEffect, useRef, type FC } from 'react';
import styled from 'styled-components';

import { WINTER_SNOW_Z_INDEX } from 'styles/constants';

import {
  SNOW_ITEMS_ATTR,
  SNOW_SKIP_ATTR,
  SNOW_SURFACE_ATTR,
} from './constants';
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

// Falling flakes and knocked-off snow live in viewport space.
// 100% of the fixed box (not 100vw/100vh): matches the drawing area
// exactly, without the scrollbar and with the iOS toolbar.
const FlakeCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  /* a canvas does not stretch to inset on its own: without these it takes
     its bitmap size, which the loop then grows every frame */
  width: 100%;
  height: 100%;
  z-index: ${WINTER_SNOW_Z_INDEX};
  pointer-events: none;
`;

// Drifts live in document space: each one is a small canvas placed on its
// card, so it scrolls with the card instead of chasing it
const DriftLayer = styled.div`
  position: absolute;
  z-index: ${WINTER_SNOW_Z_INDEX};
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

// room above the drift, and below the card edge for the overhang and its
// shadow
const DRIFT_PAD_TOP = 6;
const DRIFT_PAD_BOTTOM = 12;
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
  // pile base inside the layer, measured a few times a second
  lx: number;
  ly: number;
  // pile base in the viewport, derived every frame from one layer read
  x: number;
  y: number;
  w: number;
  placed: string;
  dirty: boolean;
};

type Palette = {
  flake: string;
  flakeShadow: string;
  snow: string;
  driftBottom: string;
  driftFace: string;
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
    driftFace: v('--winter-drift-face', '#d6e2f1'),
    driftShadow: v('--winter-drift-shadow', 'rgba(0,0,0,0.2)'),
  };
};

const samePalette = (a: Palette | null, b: Palette) =>
  !!a && (Object.keys(b) as (keyof Palette)[]).every((k) => a[k] === b[k]);

// Elements that carry a drift: marked ones, and the items of marked lists
const findSurfaces = () => {
  const found: { el: HTMLElement; kind: string | null }[] = [];
  document
    .querySelectorAll<HTMLElement>(`[${SNOW_SURFACE_ATTR}]`)
    .forEach((el) =>
      found.push({ el, kind: el.getAttribute(SNOW_SURFACE_ATTR) }),
    );
  // Section: header first, content last
  document
    .querySelectorAll<HTMLElement>(`[${SNOW_ITEMS_ATTR}]`)
    .forEach((list) => {
      const kind = list.getAttribute(SNOW_ITEMS_ATTR);
      const content = list.lastElementChild;
      if (!content) return;
      for (const el of Array.from(content.children)) {
        if (el instanceof HTMLElement) found.push({ el, kind });
      }
    });
  return found.filter(({ el }) => !el.closest(`[${SNOW_SKIP_ATTR}]`));
};

// x of a pile column's centre in the drift canvas
const colX = (j: number) => DRIFT_PAD_X + j * PILE_COL + PILE_COL / 2;

// Snow sags a little over the card edge: the drift lies on the card
// instead of being pasted in front of it. Fixed per column, scaled by depth.
const overhangAt = (pile: SnowPile, j: number) => {
  const depth = Math.min(1, pile.h[j] / 6);
  if (depth <= 0) return 0;
  // slow waves, with an occasional lump that sags lower
  const wave = Math.sin(j * 0.31) * 0.7 + Math.sin(j * 0.11 + 1) * 0.6;
  const lump = Math.max(0, Math.sin(j * 0.53 + 2) - 0.75) * 5;
  return depth * (2.4 + wave + lump);
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
const LAYOUT_SETTLE_MS = 600;
const PALETTE_EVERY_MS = 500;

const getDpr = () => Math.min(2, window.devicePixelRatio || 1);

class SnowScene {
  flakes: Flake[] = [];
  particles: Particle[] = [];
  drifts: Drift[] = [];
  pointer = { x: -9999, y: -9999 };
  palette: Palette | null = null;
  discoveredAt = -Infinity;
  // the page changed size (accordion, banner): track the drifts every frame
  // for a moment instead of a few times a second
  layoutChangedAt = -Infinity;
  paletteAt = -Infinity;
  flakesCleared = false;

  // Which elements carry a drift and where they sit in the layer.
  // Runs a few times a second; layout shifts are picked up here.
  discover(layer: HTMLElement) {
    const origin = layer.getBoundingClientRect();
    const surfaces = findSurfaces();
    const rects = surfaces.map(({ el }) => el.getBoundingClientRect());
    const keep: Drift[] = [];
    const dpr = getDpr();

    surfaces.forEach(({ el, kind }, i) => {
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

      const { inset, max } = PILE_SHAPES[kind];
      const width = rect.width - inset * 2;
      if (width < 24) return;

      let drift = this.drifts.find((d) => d.el === el);
      if (!drift || drift.pile.n !== getPileCellCount(width)) {
        const pile = createPile(width, kind);
        prefillPile(pile);
        const canvas = drift?.canvas ?? document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        drift = {
          el,
          kind,
          pile,
          canvas,
          lx: 0,
          ly: 0,
          x: 0,
          y: 0,
          w: pile.n * PILE_COL,
          placed: '',
          dirty: true,
        };
      }
      // the layer element can be replaced (remount, hot reload):
      // always hang the drift in the current one
      if (drift.canvas.parentElement !== layer) layer.appendChild(drift.canvas);

      drift.lx = rect.left - origin.left + inset;
      drift.ly = rect.top - origin.top;

      const cw = drift.w + DRIFT_PAD_X * 2;
      const ch = max + DRIFT_PAD_TOP + DRIFT_PAD_BOTTOM;
      const left = Math.round(drift.lx - DRIFT_PAD_X);
      const top = Math.round(drift.ly - max - DRIFT_PAD_TOP);
      const key = `${left}:${top}:${cw}:${ch}:${dpr}`;
      if (key !== drift.placed) {
        drift.placed = key;
        drift.canvas.width = Math.round(cw * dpr);
        drift.canvas.height = Math.round(ch * dpr);
        drift.canvas.style.width = `${cw}px`;
        drift.canvas.style.height = `${ch}px`;
        drift.canvas.style.left = `${left}px`;
        drift.canvas.style.top = `${top}px`;
        // resizing clears the bitmap
        drift.dirty = true;
      }
      keep.push(drift);
    });

    for (const d of this.drifts) {
      if (!keep.includes(d)) d.canvas.remove();
    }
    this.drifts = keep;
  }

  emit(d: Drift, cells: SweptCell[], vx: number, vy: number) {
    if (cells.length > 0) d.dirty = true;
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
    if (
      time - this.discoveredAt > DISCOVER_EVERY_MS ||
      time - this.layoutChangedAt < LAYOUT_SETTLE_MS
    ) {
      this.discover(layer);
      this.discoveredAt = time;
    }
    if (time - this.paletteAt > PALETTE_EVERY_MS) {
      const palette = readPalette();
      // theme switched: repaint the drifts in the new colours
      if (!samePalette(this.palette, palette)) {
        for (const d of this.drifts) d.dirty = true;
      }
      this.palette = palette;
      this.paletteAt = time;
    }
    const palette = this.palette ?? readPalette();

    // one layout read per frame: the drifts move with the layer on scroll
    const origin = layer.getBoundingClientRect();
    for (const d of this.drifts) {
      d.x = origin.left + d.lx;
      d.y = origin.top + d.ly;
    }

    this.drawFlakeLayer(canvas, dt, falling, palette);

    const dpr = getDpr();
    for (const d of this.drifts) {
      if (relaxPile(d.pile)) d.dirty = true;
      if (!d.dirty) continue;
      this.drawDrift(d, palette, dpr);
      d.dirty = false;
    }
  }

  drawFlakeLayer(
    canvas: HTMLCanvasElement,
    dt: number,
    falling: boolean,
    palette: Palette,
  ) {
    // nothing moves: clear once and leave the canvas alone
    if (!falling && this.particles.length === 0 && this.flakes.length === 0) {
      if (!this.flakesCleared) {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        this.flakesCleared = true;
      }
      return;
    }
    this.flakesCleared = false;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return;
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

    this.drawFlakes(ctx, W, H, dt, falling, palette);
    this.drawParticles(ctx, dt, palette);
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
            drift.dirty = true;
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

  // In the drift canvas' own coordinates: the card edge is `base`.
  // Lit from above: a bright mound, a shaded front face where the snow
  // hangs over the edge, and that overhang's shadow on the card.
  drawDrift(d: Drift, palette: Palette, dpr: number) {
    const ctx = d.canvas.getContext('2d');
    if (!ctx) return;
    const { pile } = d;
    const base = pile.max + DRIFT_PAD_TOP;
    const width = d.canvas.width / dpr;
    const height = d.canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const outline = new Path2D();
    // the top: a smooth curve through the column heights
    let px = colX(0);
    let py = base - pile.h[0];
    outline.moveTo(px, py);
    for (let j = 1; j < pile.n; j++) {
      const x = colX(j);
      const y = base - pile.h[j];
      outline.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x;
      py = y;
    }
    // the overhang, right to left; +1 so no gap shows at the edge
    px = colX(pile.n - 1);
    py = base + 1;
    outline.lineTo(px, py);
    for (let j = pile.n - 2; j >= 0; j--) {
      const x = colX(j);
      const y = base + 1 + overhangAt(pile, j);
      outline.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x;
      py = y;
    }
    outline.closePath();

    // the overhang's shadow, only on the card
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, base, width, height - base);
    ctx.clip();
    ctx.shadowColor = palette.driftShadow;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = palette.driftFace;
    ctx.fill(outline);
    ctx.restore();

    // the mound
    const top = ctx.createLinearGradient(0, base - pile.max, 0, base);
    top.addColorStop(0, palette.snow);
    top.addColorStop(1, palette.driftBottom);
    ctx.fillStyle = top;
    ctx.fill(outline);

    // the front face, from just above the edge down to the overhang
    const faceTop = base - 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, faceTop, width, height - faceTop);
    ctx.clip();
    const face = ctx.createLinearGradient(0, faceTop, 0, base + 5);
    face.addColorStop(0, palette.driftBottom);
    face.addColorStop(1, palette.driftFace);
    ctx.fillStyle = face;
    ctx.fill(outline);
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
    // mouse and pen only: a finger scrolling the page must not sweep drifts
    const isPointer = (e: PointerEvent) =>
      e.pointerType === 'mouse' || e.pointerType === 'pen';
    const onMove = (e: PointerEvent) => {
      if (isPointer(e)) scene.onPointerMove(e.clientX, e.clientY);
    };
    const onLeave = () => {
      scene.pointer.x = -9999;
      scene.pointer.y = -9999;
    };
    const onClick = (e: MouseEvent) => scene.onClick(e.clientX, e.clientY);
    const root = document.documentElement;
    const observer =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            scene.layoutChangedAt = performance.now();
          })
        : null;
    observer?.observe(document.body);
    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    window.addEventListener('click', onClick, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
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
