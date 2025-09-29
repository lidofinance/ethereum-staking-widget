import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const CanICreateANewDepositRequest: FC = () => {
  return (
    <Accordion summary="If I don’t claim my deposited amount, can I create a new deposit request?">
      <p>
        Yes. Once your strETH is available for claiming, you can submit another
        deposit request. However, please note that when you create a new
        request, the claimable amount will be automatically transferred to your
        wallet as part of the new deposit transaction.
      </p>
    </Accordion>
  );
};
