import type { Hash } from 'viem';

import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

type VaultTxStageSuccessProps = {
  txHash?: Hash;
  newBalance: bigint;
  balanceSymbol: string;
  description: React.ReactNode;
};

export const VaultDepositTxStageSuccess = ({
  txHash,
  newBalance,
  balanceSymbol,
  description,
}: VaultTxStageSuccessProps) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          Your new balance is{' '}
          <TxAmount amount={newBalance} symbol={balanceSymbol} />
        </>
      }
      description={description}
      showEtherscan
    />
  );
};
