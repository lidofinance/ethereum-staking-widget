import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from '../types';

export const TxStagePermit: FC = () => {
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.PERMIT)}
      title="Please sign the message"
      description="Processing your request"
      footerHint="Confirm request in your wallet"
    />
  );
};
