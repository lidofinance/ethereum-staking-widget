import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesLossProtectionWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the loss protection work?" id={id}>
      <p>
        EarnUSD has two layers of loss protection designed to absorb eligible
        losses before they affect your deposits: Firelight protection and a
        buffer funded by Lido DAO.
      </p>
      <p>
        Firelight provides the first layer. It can compensate approved losses in
        participating vault positions, up to a separate limit for each vault.
        That limit is set at 5% of the vault&apos;s eligible net asset value for
        each 30-day period and updated through an accepted renewal or amendment
        as the vault&apos;s value changes. Any payments reduce the protection
        remaining for that period.
      </p>
      <p>
        Lido DAO puts its own capital behind the second layer. The DAO holds
        deposits alongside users. For losses that meet the governance
        conditions, its vault shares can be reduced to offset losses for other
        depositors, up to the value of its available position.
      </p>
      <p>
        Together, these mechanisms provide a buffer against losses, not a
        guarantee of your deposit. Each has its own eligibility rules and
        limits, so some losses may still affect your balance.
      </p>
    </FaqItem>
  );
};
