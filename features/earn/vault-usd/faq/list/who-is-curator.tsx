import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhoIsCurator: FC = () => {
  return (
    <AccordionTransparent
      summary="Who is the curator for EarnUSD, and what's their role?"
      id="earnusd-curator"
    >
      <p>
        The two subVaults are curated by UltraYield, a subsidiary of Edge
        Capital. Their role includes overseeing strategy execution, risk
        management, and overall vault performance.
      </p>
    </AccordionTransparent>
  );
};
