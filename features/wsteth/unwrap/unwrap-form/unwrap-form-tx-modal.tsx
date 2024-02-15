import { useWatch } from 'react-hook-form';
import { useTransactionModal } from 'shared/transaction-modal';
import { useStethByWsteth } from 'shared/hooks';
import { useUnwrapFormData } from '../unwrap-form-context';
import { convertTxStageToLegacy } from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { TxStageModal } from 'shared/components';
import { TX_OPERATION as TX_OPERATION_LEGACY } from 'shared/components/tx-stage-modal';
import type { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { Zero } from '@ethersproject/constants';

export const UnwrapFormTxModal = () => {
  const { stethBalance } = useUnwrapFormData();
  const { dispatchModalState, onRetry, ...modalState } = useTransactionModal();

  const [amount] = useWatch<RequestFormInputType, ['amount']>({
    name: ['amount'],
  });
  const { data: willReceiveStETH } = useStethByWsteth(amount ?? Zero);

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
