import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';
import Link from 'next/link';

export const WhoIsCurator: FC = () => {
  return (
    <FaqItem
      summary="Who is the curator for EarnUSD, and what's their role?"
      id="earnusd-curator"
    >
      <p>
        The two subVaults are curated by The EarnUSD is curated by{' '}
        <Link href="https://mellow.finance/" target="_blank">
          Mellow
        </Link>
        . Their role includes overseeing strategy execution, risk management,
        and overall vault performance.
      </p>
    </FaqItem>
  );
};
