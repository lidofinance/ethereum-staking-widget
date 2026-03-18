import { FaqItem } from 'features/earn/shared/v2/faq';
import { FC } from 'react';

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <>
        <p>
          You can deposit ETH, WETH, stETH, or wstETH and, through the upgrade
          flow, also migrate GG, strETH, or DVstETH to receive earnETH share
          tokens from the EarnETH vault.
        </p>
        <p>
          After submitting a deposit, the request will appear as pending in the
          Lido UI. For stETH deposits, the asset will first be wrapped, and you
          will see a pending wstETH deposit. Once the funds are allocated to the
          vault, earnETH tokens are minted and become available to claim in the
          UI. Not claiming your tokens does not affect reward accrual.
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
