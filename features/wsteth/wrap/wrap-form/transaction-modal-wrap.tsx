import { useTransactionModal } from 'shared/transaction-modal/transaction-modal-context';
import { useFormContext } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { TransactionModalStagesRouted } from 'shared/transaction-modal/transaction-modal-stages-routed';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export const TransactionModalWrap = () => {
  const { watch } = useFormContext<WrapFormInputType>();
  const { allowance, wstethBalance, willReceiveWsteth } = useWrapFormData();
  const {
    dispatchModalState,
    onRetry,
    isModalOpen,
    txHash,
    amount,
    errorText,
    txStage,
    txOperation,
  } = useTransactionModal();
  const [token] = watch(['token']);

  return (
    <TransactionModalStagesRouted
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={txStage}
      txOperation={txOperation}
      operationText="Wrapping"
      txHash={txHash}
      amount={amount}
      amountToken={getTokenDisplayName(token)}
      willReceiveAmount={willReceiveWsteth}
      willReceiveAmountToken="wstETH"
      balance={wstethBalance}
      balanceToken={'wstETH'}
      allowanceAmount={allowance}
      failedText={errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
