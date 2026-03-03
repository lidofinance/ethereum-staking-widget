import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhyReceiveUsdcOnWithdrawal: FC = () => {
  return (
    <AccordionTransparent
      summary="Why, even though deposits are made in USDC/USDT, do I only receive USDC on withdrawal?"
      id="earnusd-usdc-withdrawal"
    >
      <p>
        Withdrawals are processed in USDC because this format allows the vault
        to reduce the time to claim and complete a withdrawal.
      </p>
    </AccordionTransparent>
  );
};
