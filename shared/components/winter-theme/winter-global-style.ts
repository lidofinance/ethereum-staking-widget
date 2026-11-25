import { createGlobalStyle } from 'styled-components';

// Theme tokens branch in CSS (see styles/global.ts): data-lido-theme is set
// before the first paint, theme.name is not. The canvases read the same
// tokens through getComputedStyle.
const LIGHT = `
  --winter-sky-0: #c4dcf6;
  --winter-sky-1: #dce9f8;
  --winter-sky-2: #eaf0f7;
  --winter-far: #d7e3f1;
  --winter-far-forest: #bccee3;
  --winter-mid: #e4ecf5;
  --winter-mid-forest: #9db5d1;
  --winter-mid-caps: rgba(255, 255, 255, 0.95);
  --winter-near-top: #ffffff;
  --winter-near-rim: #ffffff;
  --winter-snow: #ffffff;
  --winter-drift-bottom: #eef3fa;
  --winter-drift-face: #d3dfee;
  --winter-drift-shadow: rgba(39, 56, 82, 0.18);
  --winter-flake: #ffffff;
  --winter-flake-shadow: rgba(60, 100, 150, 0.45);
  --winter-wire: #6d5d4b;
  --winter-eave: rgba(70, 90, 120, 0.35);
  --winter-unlit: #b9c2ce;
  --winter-light-core: #ffb53d;
  --winter-light-glow: rgba(255, 166, 40, 0.85);
  --winter-light-halo: rgba(255, 170, 60, 0.35);
  --winter-ice-0: rgba(255, 255, 255, 0.98);
  --winter-ice-1: rgba(100, 168, 232, 0.9);
  --winter-ice-shadow: rgba(39, 56, 82, 0.24);
  --winter-frost: rgba(70, 150, 220, 0.5);
  --winter-chip-shadow: rgba(39, 56, 82, 0.1);
  --winter-night-display: none;
  --winter-day-display: block;
`;

const DARK = `
  --winter-sky-0: #0a0f1f;
  --winter-sky-1: #121a30;
  --winter-sky-2: #1a2034;
  --winter-far: #1e263a;
  --winter-far-forest: #171e30;
  --winter-mid: #232b40;
  --winter-mid-forest: #121829;
  --winter-mid-caps: rgba(205, 220, 245, 0.55);
  --winter-near-top: #3a4560;
  --winter-near-rim: rgba(205, 222, 250, 0.55);
  --winter-snow: #e4ecf7;
  --winter-drift-bottom: #e2eaf5;
  --winter-drift-face: #a9b8cf;
  --winter-drift-shadow: rgba(0, 0, 0, 0.45);
  --winter-flake: #ffffff;
  --winter-flake-shadow: rgba(0, 0, 0, 0);
  --winter-wire: #5a4c3e;
  --winter-eave: rgba(150, 170, 210, 0.3);
  --winter-unlit: #4a4a55;
  --winter-light-core: #fff4d8;
  --winter-light-glow: rgba(255, 200, 110, 0.9);
  --winter-light-halo: rgba(255, 176, 80, 0.32);
  --winter-ice-0: rgba(235, 246, 255, 0.95);
  --winter-ice-1: rgba(150, 200, 240, 0.35);
  --winter-ice-shadow: rgba(0, 0, 0, 0.35);
  --winter-frost: rgba(205, 232, 255, 0.6);
  --winter-chip-shadow: rgba(0, 0, 0, 0.3);
  --winter-night-display: block;
  --winter-day-display: none;
`;

export const WinterGlobalStyle = createGlobalStyle`
  html,
  [data-lido-theme='light'] {
    ${LIGHT}
  }
  @media (prefers-color-scheme: dark) {
    html:not([data-lido-theme='light']) {
      ${DARK}
    }
  }
  [data-lido-theme='dark'] {
    ${DARK}
  }

  /* the app's fixed 1560x784 glow would show its edges over the sky */
  [data-background-gradient] {
    display: none;
  }

  /* lights stay lit: only the halo and the size breathe */
  @keyframes winter-twinkle {
    0%, 100% {
      transform: scale(1);
      filter: brightness(0.92);
    }
    10% {
      transform: scale(1.45);
      filter: brightness(1.25);
      box-shadow:
        0 0 4px 2px var(--winter-light-glow),
        0 0 16px 6px var(--winter-light-halo);
    }
    28% {
      transform: scale(1);
      filter: brightness(1);
    }
  }
  @keyframes winter-tree-light {
    0%, 100% { opacity: 0.55; }
    18% { opacity: 1; }
  }
  @keyframes winter-star {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  @keyframes winter-haze {
    from { transform: translateX(-3%) scaleY(1); }
    to { transform: translateX(3%) scaleY(1.15); }
  }
  @keyframes winter-aurora-hue {
    from { filter: blur(1.4px) saturate(1.7) brightness(1.15) hue-rotate(-16deg); }
    to { filter: blur(1.4px) saturate(1.7) brightness(1.15) hue-rotate(24deg); }
  }
  @keyframes winter-pop {
    from { transform: scale(0.9); }
    to { transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-winter] *,
    [data-winter] *::before {
      animation: none !important;
      transition: none !important;
    }
  }
`;
