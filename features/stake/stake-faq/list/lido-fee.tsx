import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { useProtocolFee } from 'shared/hooks/use-protocol-fee';

export const LidoFee: FC = () => {
  const protocolFee = useProtocolFee();

  const feeValue =
    protocolFee.initialLoading || !protocolFee.totalFeeString
      ? DATA_UNAVAILABLE
      : `${protocolFee.totalFeeString}%`;

  return (
    <Accordion summary="What fee is applied by Lido? What is this used for?">
      <p>
        The protocol applies a {feeValue} fee on staking rewards. This fee is
        split between node operators and the Lido DAO. That means the users
        receive 90% of the staking rewards returned by the networks.
      </p>
    </Accordion>
  );
};
