import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsLido: FC = () => {
  return (
    <Accordion defaultExpanded summary="What is Lido?">
      <p>
        Lido is the name of a family of open-source peer-to-system software
        tools deployed and functioning on the Ethereum blockchain network. The
        software enables users to mint transferable utility tokens, which
        receive rewards linked to the related validation activities of writing
        data to the blockchain, while the tokens can be used in other on-chain
        activities.
      </p>
    </Accordion>
  );
};
