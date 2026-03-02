import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsEarnUsd: FC = () => {
  return (
    <AccordionTransparent
      defaultExpanded
      summary="What is EarnUSD, and how does it work?"
    >
      <p>
        EarnUSD provides on-chain access to strategies involving USD-denominated
        digital assets. It uses defined asset selection and risk controls,
        supported by transparent reporting.
      </p>
      <p>
        EarnUSD consists of two subVaults, each subVault specializes in its
        respective strategy, and combining their strengths aims to deliver
        risk-adjusted rewards for EarnUSD users&apos; stable assets. UltraYield
        (by Edge Capital) is appointed to provide curation services for both
        subVaults.
      </p>
    </AccordionTransparent>
  );
};
