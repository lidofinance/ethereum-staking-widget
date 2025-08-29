import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhatIsLidoDVV: FC = () => {
  const LEARN_MORE_PATH = 'https://docs.mellow.finance/dvsteth-vault/overview';
  return (
    <Accordion summary="What is Lido DVV, and how does it work?">
      <p>
        The Decentralized Validator Vault accepts ETH deposits to the Lido
        protocol, accelerating the adoption of Distributed Validator Technology
        (DVT) from Obol and SSV Network, which in turn increases Ethereum
        validator security and resilience by distributing control across
        multiple operators, reducing single points of failure and slashing
        risks. Eligible vault users receive tokens from Obol and SSV, based on
        the number of corresponding DVT-based validators active in the Lido
        protocol. <Link href={LEARN_MORE_PATH}>Learn more.</Link>
      </p>
    </Accordion>
  );
};
