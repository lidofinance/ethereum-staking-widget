import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowAreDepositsProtected: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How are deposits protected?" id={id}>
      <p>
        EarnETH has two layers of loss protection designed to absorb eligible
        losses before they affect user deposits:{' '}
        <Link
          target="_blank"
          href="https://docs.firelight.finance/resources/cover-scope"
        >
          Firelight protection
        </Link>{' '}
        and the{' '}
        <Link
          target="_blank"
          href="https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xd32eab4ce41e2754d8a51fdf89bd9f4eb43ecbeb7b60d0e93ce84bc3e4d4c8a3"
        >
          Lido DAO&apos;s Loss Protection
        </Link>
        . Both layers apply to all depositors automatically, with no action
        needed. Deposits are not protected from any and all loss. Terms and
        conditions apply.
      </p>
      <p>
        <strong>Firelight provides the first layer.</strong> It can compensate
        for eligible and approved losses in participating vault positions,
        within limits set for each 30-day period and updated through an accepted
        renewal or amendment as the vault&apos;s value changes. Any payments
        reduce the protection remaining for that period. Current limits are
        shown in the Protected badge at the top of this page.
      </p>
      <p>
        <strong>Lido DAO puts its own capital behind the second layer.</strong>{' '}
        The DAO holds deposits alongside users. For losses that meet the
        governance conditions, its vault shares can be reduced to offset losses
        for other depositors, up to the value of its available position. The
        current position is reported quarterly.
      </p>
      <p>
        Together, these mechanisms provide a buffer against losses, not a
        guarantee of user deposits. Each has its own eligibility rules and
        limits. Losses may still affect depositors&apos; balances.
      </p>
    </FaqItem>
  );
};
