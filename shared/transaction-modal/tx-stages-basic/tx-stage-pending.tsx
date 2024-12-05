import type { Hash } from 'viem';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconLoader } from './icons';

type TxStagePendingProps = {
  description?: React.ReactNode;
  title: React.ReactNode;
  txHash?: Hash;
};

export const TxStagePending = ({
  title,
  description,
  txHash,
}: TxStagePendingProps) => {
  return (
    <TransactionModalContent
      icon={<StageIconLoader />}
      title={title}
      description={description || 'Awaiting block confirmation'}
      footerHint={txHash && <TxLinkEtherscan txHash={txHash} />}
    />
  );
};
