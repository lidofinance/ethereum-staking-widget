import type { Hash } from 'viem';

import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

type VaultTxStageSuccessProps = {
  txHash?: Hash;
  newBalance: bigint;
  vaultSymbol: string;
};

export const VaultTxStageSuccess = ({
  txHash,
  newBalance,
  vaultSymbol,
}: VaultTxStageSuccessProps) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          Your new balance is{' '}
          <TxAmount amount={newBalance} symbol={vaultSymbol} />;
        </>
      }
      description={`Depositing operation was successful`}
      showEtherscan={true}
    />
  );
};
