import { useTransactionModal } from 'shared/transaction-modal';
import { convertTxStageToLegacy } from 'features/wsteth/shared/utils/convertTxModalStageToLegacy';
import { TxStageModal } from 'shared/components';
import { formatBalance } from 'utils';
import { TX_OPERATION as TX_OPERATION_LEGACY } from 'shared/components/tx-stage-modal';
import { useStakeFormData } from './stake-form-context';

export const StakeFormModal = () => {
  const { stethBalance } = useStakeFormData();
  const {
    dispatchModalState,
    onRetry,
    amount,
    txHash,
    txStage,
    isModalOpen,
    errorText,
  } = useTransactionModal();

  return (
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={convertTxStageToLegacy(txStage)}
      txOperation={TX_OPERATION_LEGACY.STAKING}
      txHash={txHash}
      amount={amount ? formatBalance(amount, 18) : ''}
      amountToken="ETH"
      willReceiveAmount={amount ? formatBalance(amount, 18) : undefined}
      willReceiveAmountToken="stETH"
      balance={stethBalance}
      balanceToken="stETH"
      failedText={errorText}
      onRetry={() => onRetry?.()}
    />
  );
};
