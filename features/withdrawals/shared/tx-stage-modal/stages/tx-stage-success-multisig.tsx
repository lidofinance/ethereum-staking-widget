import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from '../types';

export const TxStageSuccessMultisig = () => {
  const { isLedger } = useConnectorInfo();
  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.SUCCESS_MULTISIG)}
      title="Success"
      description="Your transaction has been successfully created in the multisig wallet and awaits approval from other participants"
    />
  );
};
