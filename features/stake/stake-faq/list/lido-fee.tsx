import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';

import { DATA_UNAVAILABLE } from 'consts/text';

export const LidoFee: FC = () => {
  const contractRpc = useSTETHContractRPC();
  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });
  const feeValue =
    lidoFee.initialLoading || !lidoFee.data
      ? DATA_UNAVAILABLE
      : `${lidoFee.data / 100}%`;

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
