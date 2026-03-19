import { FaqItem } from 'features/earn/shared/v2/faq';
import { FC } from 'react';

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <>
        <p>
          You can deposit ETH, WETH, stETH, or wstETH and, through the upgrade
          flow, also migrate GG, strETH, or DVstETH to receive earnETH share
          tokens from the EarnETH vault. Once you deposit, earnUSD is issued
          directly to your wallet, with no pending state or separate claim step
          required.
        </p>
        <p>Note, that as part of the upgrade:</p>
        <ul>
          <li>
            GG and strETH will be integrated into the EarnETH vault as stRATEGY
            and GGV subvaults
          </li>
          <li>
            DVstETH will be directly upgraded, with holders receiving an
            equivalent amount in earnETH share tokens
          </li>
        </ul>
      </>
    </FaqItem>
  );
};
