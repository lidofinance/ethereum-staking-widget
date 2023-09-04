import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { convertTxStageToLegacy } from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { TxStageModal } from 'shared/components';
import { formatBalance } from 'utils';
import { useUnwrapFormData } from '../unwrap-form-context';
import { TX_OPERATION as TX_OPERATION_LEGACY } from 'shared/components/tx-stage-modal';

export const UnwrapFormTxModal = () => {
  const { stethBalance, willReceiveStETH } = useUnwrapFormData();
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();

  return (
    <TxStageModal
      open={modalState.isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(modalState.txStage)}
      txOperation={TX_OPERATION_LEGACY.UNWRAPPING}
      txHash={modalState.txHash}
      amount={modalState.amount ? formatBalance(modalState.amount) : ''}
      amountToken="wstETH"
      willReceiveAmount={formatBalance(willReceiveStETH)}
      willReceiveAmountToken="stETH"
      balance={stethBalance}
      balanceToken="stETH"
      failedText={modalState.errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
