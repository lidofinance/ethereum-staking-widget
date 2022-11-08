import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';

const TITLE = 'What fee is applied by Lido? What is this used for?';

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
    <Accordion summary={TITLE}>
      <p>
        Lido applies a {feeValue} fee on a user’s staking rewards. This fee is
        split between node operators and the Lido DAO.
      </p>
    </Accordion>
  );
};
