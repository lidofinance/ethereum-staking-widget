import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhoIsCurator: FC = () => {
  return (
    <FaqItem
      summary="Who is the curator for EarnUSD, and what's their role?"
      id="earnusd-curator"
    >
      <p>
        The two subVaults are curated by UltraYield, a subsidiary of Edge
        Capital. Their role includes overseeing strategy execution, risk
        management, and overall vault performance.
      </p>
    </FaqItem>
  );
};
