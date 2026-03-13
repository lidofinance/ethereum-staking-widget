import { FaqItem } from 'features/earn/shared/v2/faq';
import { FC } from 'react';

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <p>
        You can deposit ETH, wstETH, GGV, strETH or DVV to receive earnETH share
        tokens of the EarnETH vault. After submission, your deposit request will
        appear as pending in the Lido UI. Once your funds enter the vault,
        earnETH tokens are generated and can be claimed in the Lido UI. Not
        claiming your tokens does not affect reward accrual.
      </p>
    </FaqItem>
  );
};
