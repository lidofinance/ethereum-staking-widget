import type { FC } from 'react';

import { SnowCanvas } from './snow-canvas';
import { WinterBackdrop } from './winter-backdrop';
import { WinterGlobalStyle } from './winter-global-style';
import { WinterStakeDecor } from './winter-stake-decor';
import { useWinterTheme } from './winter-theme-context';

// Page-level layers of the New Year theme. Everything here renders only
// when the manifest flag `holidayDecorEnabled` is on.
export const WinterTheme: FC = () => {
  const { enabled } = useWinterTheme();
  if (!enabled) return null;

  return (
    <>
      <WinterGlobalStyle />
      <WinterBackdrop />
      <WinterStakeDecor />
      <SnowCanvas />
    </>
  );
};
