import { useTransactionModal } from 'shared/transaction-modal';
import { TransactionModalStagesRouted } from 'shared/transaction-modal/transaction-modal-stages-routed';
import { useUnwrapFormData } from '../unwrap-form-context';

export const TransactionModalUnwrap = () => {
  const { stethBalance, willReceiveStETH } = useUnwrapFormData();
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();

  return (
    <TransactionModalStagesRouted
      open={modalState.isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={modalState.txStage}
      txOperation={modalState.txOperation}
      operationText="Unwrapping"
      txHash={modalState.txHash}
      amount={modalState.amount}
      amountToken="wstETH"
      willReceiveAmount={willReceiveStETH}
      willReceiveAmountToken="stETH"
      balance={stethBalance}
      balanceToken="stETH"
      failedText={modalState.errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
