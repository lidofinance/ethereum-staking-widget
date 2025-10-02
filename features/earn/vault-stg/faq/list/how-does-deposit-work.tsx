import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesDepositWork: FC = () => {
  return (
    <Accordion summary="How does the deposit work?">
      <p>
        You can deposit ETH, WETH, or wstETH to receive strETH share tokens of
        stRATEGY vault. Once submitted, your deposit request will appear as
        pending in the Lido UI. When your funds enter the vault strETH tokens
        are generated, and can be claimed in the Lido UI. Not claiming your
        tokens won’t affect the rewards accrual.
      </p>
    </Accordion>
  );
};
