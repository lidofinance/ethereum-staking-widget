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
          <strong>Platform fee (AUM fee):</strong> 1% annually, pro-rated for
          the time your deposited tokens remain in the vault, and built into the
          earnETH token price.
        </li>
        <li>
          <strong>Performance fee (allocated to subVault curators):</strong> 10%
          of accrued rewards is deducted from gains before those gains are
          reflected in the earnETH token price.
        </li>
      </ul>
      <p>
        As a result, your earnETH token balance stays the same, while the value
        per token adjusts over time to account for fees and performance.
      </p>
    </FaqItem>
  );
};
