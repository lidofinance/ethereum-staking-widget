import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';
import Link from 'next/link';

export const WhoIsCurator: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="Who is the curator for EarnUSD, and what's their role?"
      id={id}
    >
      <p>
        The two EarnUSD subVaults are curated by{' '}
        <Link href="https://mellow.finance/" target="_blank">
          Mellow
        </Link>
        . Their role includes overseeing strategy execution, risk management,
        and overall vault performance.
      </p>
    </FaqItem>
  );
};
