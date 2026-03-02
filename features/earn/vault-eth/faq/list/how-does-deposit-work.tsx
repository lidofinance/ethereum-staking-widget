import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowDoesDepositWork: FC = () => {
  return (
    <AccordionTransparent
      summary="How does the deposit work?"
      id="earneth-deposit-work"
    >
      <p>
        You can deposit ETH, wstETH, GGV, strETH or DVV to receive earnETH share
        tokens of the EarnETH vault. After submission, your deposit request will
        appear as pending in the Lido UI. Once your funds enter the vault,
        earnETH tokens are generated and can be claimed in the Lido UI. Not
        claiming your tokens does not affect reward accrual.
      </p>
    </AccordionTransparent>
  );
};
