import type { Hash } from 'viem';
import {
  TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import { TxStageSignOperationAmount } from 'shared/transaction-modal/tx-stages-composed/tx-stage-amount-operation';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { FormatToken } from 'shared/formatters';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';

// Placeholder stages: the texts and the layout of the slow lane's modal are
// pending a design; the stage sequence is what the stake flow drives

const STAGE_OPERATION_ARGS = {
  willReceiveToken: 'wstETH',
  operationText: 'Staking via Ethereum',
};

const STAGE_APPROVE_ARGS = {
  token: TOKENS_TO_STAKE.WETH,
  willReceiveToken: 'wstETH',
  operationText: 'Unlocking',
};

const getTxModalStagesSlowStake = (
  transitStage: TransactionModalTransitStage,
) => ({
  ...getGeneralTransactionModalStages(transitStage),

  signApproval: (amount: bigint) =>
    transitStage(
      <TxStageSignOperationAmount {...STAGE_APPROVE_ARGS} amount={amount} />,
    ),

  pendingApproval: (amount: bigint, txHash?: Hash) =>
    transitStage(
      <TxStageSignOperationAmount
        {...STAGE_APPROVE_ARGS}
        amount={amount}
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
        isPending
        txHash={txHash}
      />,
    ),

  // The L2 transaction landed: the stake is on its way, not staked yet. The
  // message id is the handle to follow it with
  success: (
    amount: bigint,
    token: TOKENS_TO_STAKE,
    chainName: string,
    txHash?: Hash,
    messageId?: Hash,
  ) =>
    transitStage(
      <TxStageSuccess
        txHash={txHash}
        title="Stake sent to Ethereum"
        description={
          <>
            Your <FormatToken amount={amount} symbol={token} /> is being staked
            on Ethereum. The wstETH arrives on {chainName} in about an hour.
            {messageId && (
              <>
                {' '}
                <a
                  href={`https://ccip.chain.link/msg/${messageId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Track the transfer
                </a>
              </>
            )}
          </>
        }
      />,
      { isClosableOnLedger: true },
    ),
});

export const useTxModalStagesL2SlowStake = () => {
  return useTransactionModalStage(getTxModalStagesSlowStake);
};
