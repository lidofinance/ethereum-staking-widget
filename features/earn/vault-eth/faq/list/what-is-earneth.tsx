import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsEarnEth: FC = () => {
  return (
    <AccordionTransparent
      defaultExpanded
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
        UltraYield (by Edge Capital) and Veda are appointed to provide curation
        services for subVaults — stRATEGY and GGV.
      </p>
    </AccordionTransparent>
  );
};
