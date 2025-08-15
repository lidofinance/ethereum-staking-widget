import type { Hash } from 'viem';

import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';

type VaultTxStageSuccessProps = {
  txHash?: Hash;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export const VaultCustomTxStageSuccess = ({
  txHash,
  title,
  description,
}: VaultTxStageSuccessProps) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={title}
      description={description}
      showEtherscan
    />
  );
};
