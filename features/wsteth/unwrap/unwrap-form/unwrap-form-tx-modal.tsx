import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import {
  convertTxStageToLegacy,
  convertTxStageToLegacyTxOperation,
} from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { TxStageModal } from 'shared/components';
import { formatBalance } from 'utils';
import { useUnwrapFormData } from '../unwrap-form-context';

export const UnwrapFormTxModal = () => {
  const { stethBalance, willReceiveStETH } = useUnwrapFormData();
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();

  return (
    <TxStageModal
      open={modalState.isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(modalState.txStage)}
      txOperation={convertTxStageToLegacyTxOperation(modalState.txStage)}
      txHash={modalState.txHash}
      amount={
        modalState.requestAmount ? formatBalance(modalState.requestAmount) : ''
      }
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
