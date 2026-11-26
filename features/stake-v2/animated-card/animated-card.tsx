import type { CardProps } from '@lidofinance/lido-app-ui';

import { LiquidBackground } from './liquid-background';
import { CardWithBackground } from './styles';

/** Card with the animated liquid blob behind its top edge */
export const AnimatedCard = ({ children, ...props }: CardProps) => (
  <CardWithBackground {...props} clip>
    <LiquidBackground />
    {children}
  </CardWithBackground>
);
