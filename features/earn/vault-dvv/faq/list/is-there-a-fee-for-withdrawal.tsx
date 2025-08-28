import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const IsThereAFeeForWithdrawal: FC = () => {
  return (
    <Accordion summary="Is there a fee for withdrawal?">
      <p>
        There’s no withdrawal fee. However, as with any Ethereum transaction,
        you’ll need to pay a network gas fee. Additionally, because DVV’s
        underlying token is wstETH, both the vault and any withdrawn wstETH are
        subject to Lido’s 10% protocol fee on the net staking APR.
      </p>
    </Accordion>
  );
};
