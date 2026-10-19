import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';
import { EarnUpToBanner } from 'shared/banners/earn-up-to-banner';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { AmountBanner } from 'shared/banners/amount-banners';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'stETH',
  operationText: 'Staking',
};

const STAGE_UNWRAP_ARGS = {
  token: TOKENS_TO_STAKE.WETH,
  willReceiveToken: TOKENS_TO_STAKE.ETH,
  operationText: 'Unwrapping',
};

const getTxModalStagesStake = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signUnwrap: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_UNWRAP_ARGS}
        amount={amount}
        willReceive={amount}
      />,
    ),

  pendingUnwrap: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_UNWRAP_ARGS}
        amount={amount}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  sign: (amount: bigint, token: TOKENS_TO_STAKE) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        token={token}
        amount={amount}
        willReceive={amount}
      />,
    ),

  pending: (
    amount: bigint,
    token: TOKENS_TO_STAKE,
    txHash?: Hash,
    isAA?: boolean,
  ) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_OPERATION_ARGS}
        token={token}
        amount={amount}
        isAA={isAA}
        willReceive={amount}
        isPending
        txHash={txHash}
      />,
    ),

  success: (balance: bigint, preStakeBalance: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageOperationSucceedBalanceShown
        txHash={txHash}
        balance={balance}
        balanceToken={'stETH'}
        operationText={'Staking'}
        footer={
          <AmountBanner
            isModal
            initialBalance={preStakeBalance}
            placement="after_stake"
          >
            <EarnUpToBanner
              matomoEvent={MATOMO_CLICK_EVENTS_TYPES.startEarning}
              placement="afterStake"
            />
          </AmountBanner>
        }
      />,
      {
        isClosableOnLedger: true,
      },
    ),
});

export const useTxModalStagesStake = () => {
  return useTransactionModalStage(getTxModalStagesStake);
};
