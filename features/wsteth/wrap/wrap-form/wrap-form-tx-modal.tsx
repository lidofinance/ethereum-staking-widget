import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
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
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();
  const [token] = watch(['token']);

  return (
    <TxStageModal
      open={modalState.isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(modalState.txStage)}
      txOperation={convertTxStageToLegacyTxOperationWrap(modalState.txStage)}
      txHash={modalState.txHash}
      amount={
        modalState.requestAmount ? formatBalance(modalState.requestAmount) : ''
      }
      amountToken={getTokenDisplayName(token)}
      willReceiveAmount={formatBalance(willReceiveWsteth)}
      willReceiveAmountToken="wstETH"
      balance={wstethBalance}
      balanceToken={'wstETH'}
      allowanceAmount={allowance}
      failedText={modalState.errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
