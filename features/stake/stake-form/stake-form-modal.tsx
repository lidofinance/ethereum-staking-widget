import { useTransactionModal } from 'shared/transaction-modal';
import { TxStageModal } from 'shared/components/tx-stage-modal';
import { useStakeFormData } from './stake-form-context';

export const StakeFormModal = () => {
  const { stethBalance } = useStakeFormData();
  const {
    dispatchModalState,
    onRetry,
    amount,
    txHash,
    txStage,
    txOperation,
    isModalOpen,
    errorText,
  } = useTransactionModal();

  return (
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={txStage}
      operationText="Staking"
      txOperation={txOperation}
      txHash={txHash}
      amount={amount}
      amountToken="ETH"
      willReceiveAmount={amount}
      willReceiveAmountToken="stETH"
      balance={stethBalance}
      balanceToken="stETH"
      failedText={errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
