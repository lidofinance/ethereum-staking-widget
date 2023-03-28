import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const ClaimableAmountDifference: FC = () => {
  return (
    <Accordion
      summary="Why is the claimable amount different from my requested amount?"
      id="amountDifferentFromRequested"
    >
      <p>
        The amount you can claim may differ from your initial request due to a
        slashing occurrence. Slashings are validator penalties that can reduce
        your total claimable reward amount.
      </p>
    </Accordion>
  );
};
