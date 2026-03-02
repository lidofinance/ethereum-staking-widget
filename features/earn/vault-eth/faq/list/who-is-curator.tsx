import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhoIsCurator: FC = () => {
  return (
    <AccordionTransparent
      summary="Who is the curator for EarnETH, and what's their role?"
      id="earneth-curator"
    >
      <p>
        One subVault, stRATEGY is curated by UltraYield, a subsidiary of Edge
        Capital. The second one, GGV, is curated by Veda. Their role includes
        overseeing strategy execution, risk management, and overall vault
        performance.
      </p>
    </AccordionTransparent>
  );
};
