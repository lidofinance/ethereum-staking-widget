import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/faq';

// shared with the FAQ drawer on the vault list
export const HowDoesDepositWorkAnswer = () => (
  <>
    <p>
      You can deposit <strong>USDC or USDT</strong> to receive{' '}
      <strong>earnUSD</strong> share tokens of the EarnUSD vault. Once you
      deposit, earnUSD is issued directly to your wallet, with no pending state
      or separate claim step required.
    </p>
    <p>
      You can also deposit USDe. For USDe deposits, your deposit request will
      first appear as pending in the Lido UI. Once your funds enter the vault,
      earnUSD is generated and becomes available to claim in the Lido UI. You do
      not need to claim immediately. If you leave your earnUSD unclaimed, this
      will not affect rewards accrual.
    </p>
  </>
);

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <HowDoesDepositWorkAnswer />
    </FaqItem>
  );
};
