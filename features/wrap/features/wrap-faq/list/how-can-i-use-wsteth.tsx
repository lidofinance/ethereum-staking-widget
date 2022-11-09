import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE = 'How can I use wstETH?';

export const HowCanIUseWsteth: FC = () => {
  return (
    <Accordion defaultExpanded summary={TITLE}>
      <p>
        wstETH is useful across DeFi protocols which are based around constant
        balance tokens. This includes Uniswap, soon to be followed by ARCx, L2
        DEXes and more.
      </p>
    </Accordion>
  );
};
