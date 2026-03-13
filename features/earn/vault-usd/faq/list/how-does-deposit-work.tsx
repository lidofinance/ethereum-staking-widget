import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <p>
        You can deposit <strong>USDC or USDT</strong> to receive{' '}
        <strong>earnUSD</strong> share tokens of the EarnUSD vault. After
        submission, your deposit request will appear as <strong>pending</strong>{' '}
        in the Lido UI. Once your funds enter the vault, earnUSD tokens are
        generated and can be claimed in the Lido UI. Not claiming your tokens
        does not affect reward accrual.
      </p>
    </FaqItem>
  );
};
