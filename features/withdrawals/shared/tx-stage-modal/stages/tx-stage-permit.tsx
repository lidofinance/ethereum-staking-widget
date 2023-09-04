import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from 'shared/transaction-modal';

export const TxStagePermit: FC = () => {
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.SIGN)}
      title="Please sign the message"
      description="Processing your request"
      footerHint="Confirm request in your wallet"
    />
  );
};
