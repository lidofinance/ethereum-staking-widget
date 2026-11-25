import type { FC } from 'react';

import { SnowCanvas } from './snow-canvas';
import { WinterBackdrop } from './winter-backdrop';
import { WinterGlobalStyle } from './winter-global-style';
import { WinterStakeDecor } from './winter-stake-decor';

// The heavy part of the theme (canvases, landscape, Lido-man artwork).
// Loaded as its own chunk only when the theme is on.
export const WinterLayers: FC = () => (
  <>
    <WinterGlobalStyle />
    <WinterBackdrop />
    <WinterStakeDecor />
    <SnowCanvas />
  </>
);
