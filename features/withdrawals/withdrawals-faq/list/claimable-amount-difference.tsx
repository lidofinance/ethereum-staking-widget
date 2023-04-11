import { Accordion } from '@lidofinance/lido-ui';

export const ClaimableAmountDifference: React.FC = () => {
  return (
    <Accordion
      summary="Why is the claimable amount different from my requested amount?"
      id="amountDifferentFromRequested"
    >
      <p>
        The amount you can claim may differ from your initial request due to a
        slashing occurrence and penalties. For these reasons, the total
        claimable reward amount could reduce.
      </p>
    </Accordion>
  );
};
