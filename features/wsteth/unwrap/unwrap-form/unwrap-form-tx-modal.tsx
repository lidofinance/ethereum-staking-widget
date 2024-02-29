import { useWatch } from 'react-hook-form';
import { useTransactionModal } from 'shared/transaction-modal';
import { convertTxStageToLegacy } from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { TxStageModal } from 'shared/components';
import { UnwrapFormInputType, useUnwrapFormData } from '../unwrap-form-context';
import { TX_OPERATION as TX_OPERATION_LEGACY } from 'shared/components/tx-stage-modal';
import { useDebouncedStethByWsteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';

export const UnwrapFormTxModal = () => {
  const amount = useWatch<UnwrapFormInputType, 'amount'>({ name: 'amount' });
  const { stethBalance } = useUnwrapFormData();
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();

  const { data: willReceiveStETH } = useDebouncedStethByWsteth(amount);

  return (
    <TxStageModal
      open={modalState.isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(modalState.txStage)}
      txOperation={TX_OPERATION_LEGACY.UNWRAPPING}
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
