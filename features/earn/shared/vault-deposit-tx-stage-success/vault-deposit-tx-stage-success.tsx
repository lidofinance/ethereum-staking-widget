import type { Hash } from 'viem';

import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

type VaultTxStageSuccessProps = {
  txHash?: Hash;
  newBalance: bigint | undefined;
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
        // the balance is missing when its read failed after the tx settled:
        // the operation is still a success, only the amount is dropped
        newBalance !== undefined ? (
          <>
            Your new balance is{' '}
            <TxAmount amount={newBalance} symbol={balanceSymbol} />
          </>
        ) : (
          <>Your {balanceSymbol} balance was updated</>
        )
      }
      description={description}
      showEtherscan
    />
  );
};
