import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatFeesAreApplied: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="What fees are applied when I deposit into EarnETH?"
      id={id}
    >
      <p>
        When you deposit, you receive earnETH tokens that represent your share
        of the vault. Your earnETH token balance does not decrease to pay fees.
        Instead, fees are reflected in the value of each earnETH token:
      </p>
      <ul>
        <li>
          <strong>Platform fee (AUM fee):</strong> flexible and capped at 0.5%
          of total holdings, pro-rated for the time your deposited tokens remain
          in the vault, and built into the earnETH token price.
        </li>
        <li>
          <strong>Performance fee:</strong> flexible and capped at 20% of
          accrued rewards, deducted from gains before those gains are reflected
          in the earnETH token price.
        </li>
      </ul>
      <p>
        Fees may change to reflect market conditions, but they can never exceed
        these caps. You can always see the vault&apos;s current fees on the
        vault page.
      </p>
      <p>
        As a result, your earnETH token balance stays the same, while the value
        per token adjusts over time to account for fees and performance.
      </p>
    </FaqItem>
  );
};
