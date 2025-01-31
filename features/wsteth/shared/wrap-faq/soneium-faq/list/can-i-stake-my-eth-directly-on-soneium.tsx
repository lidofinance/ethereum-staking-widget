import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const CanIStakeMyETHDirectlyOnSoneium: FC = () => {
  return (
    <Accordion summary="Can I stake my ETH directly on Soneium?">
      <p>
        No, staking in the Lido Protocol is available only on the Ethereum
        mainnet.
      </p>
    </Accordion>
  );
};
