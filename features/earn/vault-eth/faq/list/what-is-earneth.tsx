import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatIsEarnEth: FC<{ defaultExpanded?: boolean }> = ({
  defaultExpanded,
}) => {
  return (
    <FaqItem
      defaultExpanded={defaultExpanded}
      summary="What is EarnETH, and how does it work?"
    >
      <p>
        EarnETH provides on-chain access to strategies involving ETH-denominated
        digital assets. It uses defined asset selection and risk controls,
        supported by transparent reporting.
      </p>
      <p>
        EarnETH consists of two subVaults, each subVault specializes in its
        respective strategy, and combining their strengths aims to deliver
        sustainable, risk-adjusted rewards for EarnETH users&apos; assets.
        Mellow is appointed to provide curation services for subVaults —
        stRATEGY and GGV.
      </p>
    </FaqItem>
  );
};
