import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useFormContext } from 'react-hook-form';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { formatBalance } from 'utils';
import { TxStageModal } from 'shared/components';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import {
  TX_STAGE as TX_STAGE_LEGACY,
  TX_OPERATION as TX_OPERATION_LEGACY,
} from 'shared/components/tx-stage-modal';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

const convertTxStageToLegacy = (txStage: TX_STAGE) => {
  switch (txStage) {
    case TX_STAGE.SIGN:
    case TX_STAGE.APPROVE:
    case TX_STAGE.PERMIT:
      return TX_STAGE_LEGACY.SIGN;
    case TX_STAGE.BLOCK:
      return TX_STAGE_LEGACY.BLOCK;
    case TX_STAGE.FAIL:
      return TX_STAGE_LEGACY.FAIL;
    case TX_STAGE.SUCCESS:
      return TX_STAGE_LEGACY.SUCCESS;
    case TX_STAGE.SUCCESS_MULTISIG:
      return TX_STAGE_LEGACY.SUCCESS_MULTISIG;
    case TX_STAGE.NONE:
    case TX_STAGE.BUNKER:
      return TX_STAGE_LEGACY.IDLE;
  }
};

const convertTxStageToLegacyTxOperation = (txStage: TX_STAGE) => {
  if (txStage === TX_STAGE.APPROVE) return TX_OPERATION_LEGACY.APPROVING;
  return TX_OPERATION_LEGACY.WRAPPING;
};

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
      txOperation={convertTxStageToLegacyTxOperation(modalState.txStage)}
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
