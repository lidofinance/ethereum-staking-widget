import { useTransactionModal } from 'shared/transaction-modal/transaction-modal-context';
import { useFormContext } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';
import { useWstethBySteth } from 'shared/hooks';

import { TxStageModal } from 'shared/components';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import {
  convertTxStageToLegacy,
  convertTxStageToLegacyTxOperationWrap,
} from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { Zero } from '@ethersproject/constants';

export const WrapFormTxModal = () => {
  const { watch } = useFormContext<WrapFormInputType>();
  const { allowance, wstethBalance } = useWrapFormData();
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
  const { data: willReceiveWsteth } = useWstethBySteth(amount ?? Zero);

  return (
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(txStage)}
      txOperation={convertTxStageToLegacyTxOperationWrap(txOperation)}
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
