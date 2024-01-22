import { useTransactionModal } from 'shared/transaction-modal/transaction-modal-context';
import { useFormContext } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { formatBalance } from 'utils';
import { TxStageModal } from 'shared/components';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import {
  convertTxStageToLegacy,
  convertTxStageToLegacyTxOperationWrap,
} from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';

export const WrapFormTxModal = () => {
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
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(txStage)}
      txOperation={convertTxStageToLegacyTxOperationWrap(txOperation)}
      txHash={txHash}
      amount={amount ? formatBalance(amount, 18) : ''}
      amountToken={getTokenDisplayName(token)}
      willReceiveAmount={formatBalance(willReceiveWsteth, 18)}
      willReceiveAmountToken="wstETH"
      balance={wstethBalance}
      balanceToken={'wstETH'}
      allowanceAmount={allowance}
      failedText={errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
