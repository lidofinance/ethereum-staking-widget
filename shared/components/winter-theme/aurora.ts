// Northern lights: curtains of vertical rays drawn with a pre-rendered
// gradient sprite, additive blending. The canvas is rendered at half size
// and blurred in CSS, so per frame this is ~1.5k cheap drawImage calls.

type Curtain = {
  sprite: number;
  base: number;
  amp: number;
  freq: number;
  speed: number;
  height: number;
  alpha: number;
  phase: number;
};

const CURTAINS: Curtain[] = [
  {
    sprite: 0,
    base: 0.7,
    amp: 0.1,
    freq: 0.0065,
    speed: 0.00021,
    height: 0.66,
    alpha: 0.95,
    phase: 0,
  },
  {
    sprite: 1,
    base: 0.58,
    amp: 0.12,
    freq: 0.0048,
    speed: -0.00015,
    height: 0.56,
    alpha: 0.75,
    phase: 2.1,
  },
  {
    sprite: 2,
    base: 0.8,
    amp: 0.07,
    freq: 0.009,
    speed: 0.00027,
    height: 0.42,
    alpha: 0.55,
    phase: 4.2,
  },
];

// [core, top] rgb pairs: green core, then the Lido gradient blue, lilac, peach
const SPRITE_COLORS: [string, string][] = [
  ['60,255,190', '90,150,255'],
  ['90,150,255', '190,140,255'],
  ['200,150,255', '255,180,170'],
];

const SCALE = 0.5;

const makeSprite = (core: string, top: string): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const g = c.getContext('2d');
  if (!g) return c;
  const gr = g.createLinearGradient(0, 256, 0, 0);
  gr.addColorStop(0, `rgba(${core},0)`);
  gr.addColorStop(0.06, `rgba(${core},1)`);
  gr.addColorStop(0.3, `rgba(${core},0.55)`);
  gr.addColorStop(0.65, `rgba(${top},0.3)`);
  gr.addColorStop(1, `rgba(${top},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 2, 256);
  return c;
};

export class AuroraPainter {
  private sprites: HTMLCanvasElement[] | null = null;

  draw(canvas: HTMLCanvasElement, time: number): void {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    // hidden by the light theme (display: none)
    if (!W || !H) return;

    const AW = Math.round(W * SCALE);
    const AH = Math.round(H * SCALE);
    if (canvas.width !== AW || canvas.height !== AH) {
      canvas.width = AW;
      canvas.height = AH;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!this.sprites) {
      this.sprites = SPRITE_COLORS.map(([core, top]) => makeSprite(core, top));
    }

    ctx.clearRect(0, 0, AW, AH);
    ctx.globalCompositeOperation = 'lighter';

    for (const cu of CURTAINS) {
      const sprite = this.sprites[cu.sprite];
      const pulse = 0.75 + 0.25 * Math.sin(time * 0.00035 + cu.phase);
      for (let x = 0; x < AW; x += 1) {
        const y =
          AH *
          (cu.base +
            cu.amp * Math.sin(x * cu.freq + time * cu.speed + cu.phase) +
            cu.amp *
              0.45 *
              Math.sin(x * cu.freq * 2.7 - time * cu.speed * 1.8));
        const ray =
          0.5 +
          0.5 *
            Math.sin(x * 0.11 + time * 0.0016 + cu.phase) *
            Math.sin(x * 0.017 - time * 0.0006);
        // fade out towards the screen edges
        const envelope = Math.sin(Math.PI * (x / AW));
        const len = AH * cu.height * (0.55 + 0.45 * ray);
        ctx.globalAlpha = Math.max(
          0,
          cu.alpha * pulse * (0.35 + 0.65 * ray) * (0.4 + 0.6 * envelope),
        );
        ctx.drawImage(sprite, x, y - len, 2, len);
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
