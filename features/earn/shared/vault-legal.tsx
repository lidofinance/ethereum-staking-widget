import React from 'react';

import { LegalParagraph } from './styles';

type VaultLegalProps = {
  legalDisclosure?: React.ReactNode;
  allocation?: React.ReactNode;
};

const DEFAULT_LEGAL_DISCLOSURE = (
  <b>
    Note, that the vault involves protocol, legal and other risks. You can find
    more details in the FAQ below.
  </b>
);

const DEFAULT_ALLOCATION = (
  <>
    Your deposit is distributed across a curated set of high-performing DeFi
    strategies, including lending markets (Aave, Fluid) and LP positions
    (Uniswap v4, Balancer).
    <br /> The exact allocation may vary over time based on market conditions
    and strategy performance. All strategies are ETH-correlated to help minimize
    risk from price volatility.
  </>
);

export const VaultLegal = ({
  legalDisclosure = DEFAULT_LEGAL_DISCLOSURE,
  allocation = DEFAULT_ALLOCATION,
}: VaultLegalProps) => {
  return (
    <>
      {legalDisclosure && <LegalParagraph>{legalDisclosure}</LegalParagraph>}
      {allocation && (
        <LegalParagraph>
          <b>Allocation: </b>
          {allocation}
        </LegalParagraph>
      )}
    </>
  );
};
