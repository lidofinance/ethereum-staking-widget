import { createGlobalStyle } from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

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
  --winter-drift-shadow: rgba(39, 56, 82, 0.18);
  --winter-flake: #ffffff;
  --winter-flake-shadow: rgba(60, 100, 150, 0.45);
  --winter-wire: #3e5a4a;
  --winter-unlit: #c5cdd8;
  --winter-ice-0: rgba(255, 255, 255, 0.98);
  --winter-ice-1: rgba(130, 190, 240, 0.75);
  --winter-ice-shadow: rgba(39, 56, 82, 0.15);
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
  --winter-drift-shadow: rgba(0, 0, 0, 0.45);
  --winter-flake: #ffffff;
  --winter-flake-shadow: rgba(0, 0, 0, 0);
  --winter-wire: #4b5a58;
  --winter-unlit: #4a4a55;
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

  /* bulbs stay opaque: only brightness and glow change */
  @keyframes winter-twinkle {
    0%, 62%, 100% {
      filter: brightness(1.08);
      box-shadow: 0 0 14px 3px color-mix(in srgb, var(--c) 70%, transparent);
    }
    76% {
      filter: brightness(0.68) saturate(0.9);
      box-shadow: 0 0 2px 0 color-mix(in srgb, var(--c) 25%, transparent);
    }
  }
  @keyframes winter-chase {
    0%, 14% {
      filter: brightness(1.15);
      box-shadow: 0 0 16px 4px color-mix(in srgb, var(--c) 75%, transparent);
    }
    30%, 100% {
      filter: brightness(0.7) saturate(0.9);
      box-shadow: 0 0 2px 0 color-mix(in srgb, var(--c) 25%, transparent);
    }
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
    from { filter: blur(4px) saturate(1.7) brightness(1.15) hue-rotate(-16deg); }
    to { filter: blur(4px) saturate(1.7) brightness(1.15) hue-rotate(24deg); }
  }
  @keyframes winter-pop {
    from { transform: scale(0.9); }
    to { transform: scale(1); }
  }

  /* room for Lido-man's hat between the subtitle and the stake card */
  @media ${devicesHeaderMedia.mobile} {
    [data-layout-subtitle] {
      margin-bottom: 38px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-winter] *,
    [data-winter] *::before {
      animation: none !important;
      transition: none !important;
    }
  }
`;
