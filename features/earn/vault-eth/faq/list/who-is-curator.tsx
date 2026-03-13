import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq/faq-item';

export const WhoIsCurator: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="Who is the curator for EarnETH, and what's their role?"
      id={id}
    >
      <p>
        One subVault, stRATEGY is curated by Mellow. The second one, GGV, is
        curated by Mellow as well. Their role includes overseeing strategy
        execution, risk management, and overall vault performance.
      </p>
    </FaqItem>
  );
};
