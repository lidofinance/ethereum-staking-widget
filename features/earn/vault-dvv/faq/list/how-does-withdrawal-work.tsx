import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoesWithdrawalWork: FC = () => {
  return (
    <Accordion summary="How does the withdrawal work?">
      <p>
        You can withdraw your deposited position in DVstETH to wstETH with one
        request, which includes withdrawal and claim operation in one
        transaction. Once you create the withdrawal transaction, the
        withdrawable amount of wstETH will be in your wallet immediately, no
        waiting time needed for that operation.
      </p>
    </Accordion>
  );
};
