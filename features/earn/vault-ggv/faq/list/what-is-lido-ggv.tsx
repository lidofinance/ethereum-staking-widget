import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsLidoGGV: FC = () => {
  return (
    <Accordion
      defaultExpanded
      summary="What is Lido GGV, and how does it work?"
    >
      <p>
        The Golden Goose Vault (GGV) is designed to maximize rewards on ETH and
        (w)stETH deposits while continuously optimizing for the best
        opportunities across chains.
      </p>
    </Accordion>
  );
};
