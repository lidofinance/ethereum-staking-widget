import { FC } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from 'shared/transaction-modal';

type TxStagePendingProps = {
  description: React.ReactNode;
  title: React.ReactNode;
  txHash: string | null;
};

export const TxStagePending: FC<TxStagePendingProps> = (props) => {
  const { title, description, txHash } = props;
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.BLOCK)}
      title={title}
      description={description}
      footerHint={txHash && <TxLinkEtherscan txHash={txHash} />}
    />
  );
};
