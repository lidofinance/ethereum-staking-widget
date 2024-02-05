import { FC } from 'react';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconBlock } from './icons';

type TxStagePendingProps = {
  description?: React.ReactNode;
  title: React.ReactNode;
  txHash?: string | null;
};

export const TxStagePending: FC<TxStagePendingProps> = (props) => {
  const { title, description, txHash } = props;

  return (
    <TransactionModalContent
      icon={<StageIconBlock />}
      title={title}
      description={description || 'Awaiting block confirmation'}
      footerHint={txHash && <TxLinkEtherscan txHash={txHash} />}
    />
  );
};
