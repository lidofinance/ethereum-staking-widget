import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowCanIUseWsteth: FC = () => {
  return (
    <Accordion summary="How can I use wstETH?">
      <p>
        wstETH is useful across DeFi protocols which are based around constant
        balance tokens. This includes Uniswap, soon to be followed by ARCx, L2
        DEXes and more.
      </p>
    </Accordion>
  );
};
