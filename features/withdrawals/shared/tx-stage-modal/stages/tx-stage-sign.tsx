import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from 'shared/transaction-modal';

type TxStageSignProps = {
  description: React.ReactNode;
  title: React.ReactNode;
};

export const TxStageSign: FC<TxStageSignProps> = (props) => {
  const { title, description } = props;
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.SIGN)}
      title={title}
      description={description}
      footerHint="Confirm this transaction in your wallet"
    />
  );
};
