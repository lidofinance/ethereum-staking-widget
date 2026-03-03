import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowDoesDepositWork: FC = () => {
  return (
    <AccordionTransparent
      summary="How does the deposit work?"
      id="earnusd-deposit-work"
    >
      <p>
        You can deposit <strong>USDC or USDT</strong> to receive{' '}
        <strong>earnUSD</strong> share tokens of the EarnUSD vault. After
        submission, your deposit request will appear as <strong>pending</strong>{' '}
        in the Lido UI. Once your funds enter the vault, earnUSD tokens are
        generated and can be claimed in the Lido UI. Not claiming your tokens
        does not affect reward accrual.
      </p>
    </AccordionTransparent>
  );
};
