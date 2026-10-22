import { useCallback } from 'react';
import {
  encodeFunctionData,
  getContract,
  parseEventLogs,
  type Address,
  type WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';

import {
  applyRoundUpTxParameter,
  Erc20AllowanceAbi,
  isStepSent,
  isStepSettled,
  TxFlowInterruptedError,
  TxSettledError,
  type TxFlowOptions,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { getTokenAddress } from 'config/networks/token-address';
import { getReferralAddress } from 'utils/get-referral-address';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { ErrorMessage } from 'utils/getErrorMessage';
import { type Token, TOKENS } from 'consts/tokens';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { SYNC_DEPOSIT_QUEUE_ABI } from '../abi';
import { TxModalStages } from '../types/tx-modal-stages';
import { DepositQueueGetter } from '../types/deposit-queue-getter';
import {
  DepositQueueWritableContract,
  SyncDepositQueueWritableContract,
} from '../types/contracts';

type DepositArgs = {
  amount: bigint;
  token: Token;
  referral: string | null;
};

// The steps of a deposit: the approvals only for a token short of allowance,
// the reset only for USDT, which rejects a non-zero to non-zero approval
const STEP = {
  resetApprove: 'reset-approve',
  approve: 'approve',
  deposit: 'deposit',
} as const;

// what every stage needs, read once before the first step
type DepositData = {
  tokenAddress: Address;
  depositQueue: DepositQueueWritableContract;
  referralAddress: Address;
  // Read here rather than taken from the form, so a retry after a confirmed
  // approval never approves again
  needsApprove: boolean;
  needsApprovalReset: boolean;
};

type UseDepositArgs<DepositQueueToken extends string> = {
  depositQueueGetter: DepositQueueGetter<DepositQueueToken>;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
  // the vault's query scopes, refetched after a deposit whose outcome could
  // not be read; the whole cache without it
  refetchScope?: TxFlowOptions['refetchScope'];
};

export const useDeposit = <DepositQueueToken extends string>({
  depositQueueGetter,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
  refetchScope,
}: UseDepositArgs<DepositQueueToken>) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({ amount, token, referral }: DepositArgs) => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');

      const msgValue = token === TOKENS.eth ? amount : 0n;
      const getTokenContract = (tokenAddress: Address) =>
        getContract({
          address: tokenAddress,
          abi: Erc20AllowanceAbi,
          client: {
            public: core.publicClient,
            wallet: core.walletClient as WalletClient,
          },
        });

      const { isSuccess } = await txFlow<DepositData>({
        refetchScope,
        prepare: async () => {
          const tokenAddress = getTokenAddress(core.chainId, token);
          invariant(tokenAddress, 'Token address is not defined');

          const depositQueue = depositQueueGetter({
            publicClient: core.publicClient,
            walletClient: core.walletClient as WalletClient,
            token: token as DepositQueueToken,
          });
          const referralAddress = await getReferralAddress(
            referral,
            core.publicClient,
          );

          let needsApprove = false;
          let needsApprovalReset = false;
          if (token !== TOKENS.eth) {
            const allowance = await getTokenContract(
              tokenAddress,
            ).read.allowance([address, depositQueue.address]);
            needsApprove = allowance < amount;
            needsApprovalReset =
              token === TOKENS.usdt && needsApprove && allowance > 0n;
          }

          return {
            tokenAddress,
            depositQueue,
            referralAddress,
            needsApprove,
            needsApprovalReset,
          };
        },
        callsFn: async ({ data }) => {
          const approve = (value: bigint) =>
            encodeFunctionData({
              abi: Erc20AllowanceAbi,
              functionName: 'approve',
              args: [data.depositQueue.address, value],
            });
          return [
            data.needsApprove &&
              data.needsApprovalReset && {
                stepId: STEP.resetApprove,
                to: data.tokenAddress,
                data: approve(0n),
              },
            data.needsApprove && {
              stepId: STEP.approve,
              to: data.tokenAddress,
              data: approve(amount),
            },
            {
              stepId: STEP.deposit,
              to: data.depositQueue.address,
              data: encodeFunctionData({
                abi: data.depositQueue.abi,
                functionName: 'deposit',
                args: [amount, data.referralAddress, []],
              }),
              value: msgValue,
            },
          ];
        },
        sendStep: async (step, txStagesCallback, { data }) => {
          if (step.stepId !== STEP.deposit) {
            const tokenContract = getTokenContract(data.tokenAddress);
            const approveArgs = [
              data.depositQueue.address,
              step.stepId === STEP.resetApprove ? 0n : amount,
            ] as const;
            await core.performTransaction({
              getGasLimit: (opts) =>
                tokenContract.estimateGas.approve(approveArgs, opts),
              sendTransaction: (opts) =>
                tokenContract.write.approve(approveArgs, opts),
              callback: txStagesCallback,
            });
            return;
          }
          // Both async and sync deposit queue ABIs expose an identical
          // `deposit(assets, referral, merkleProof)`. Casting to the sync
          // variant gives accurate call-site types while avoiding the
          // uncallable union that TypeScript produces for `Async | Sync`
          const depositFn: SyncDepositQueueWritableContract['write']['deposit'] =
            data.depositQueue.write.deposit;
          const estimateDepositGasFn = data.depositQueue.estimateGas.deposit;
          const depositArgs = [amount, data.referralAddress, []] as const;
          await core.performTransaction({
            getGasLimit: async (opts) =>
              applyRoundUpTxParameter(
                await estimateDepositGasFn(depositArgs, {
                  ...opts,
                  value: msgValue,
                }),
              ),
            sendTransaction: (opts) =>
              depositFn(depositArgs, { ...opts, value: msgValue }),
            callback: txStagesCallback,
          });
        },
        onSign: ({ ctx: { stepId } }) => {
          if (stepId === STEP.deposit) {
            txModalStages.sign(amount, token);
            return;
          }
          txModalStages.signApproval(amount, token);
        },
        onReceipt: ({ txHashOrCallId, isAA, ctx: { stepId } }) => {
          if (stepId === STEP.deposit) {
            txModalStages.pending(amount, token, txHashOrCallId, isAA);
            return;
          }
          txModalStages.pendingApproval(amount, token, txHashOrCallId);
        },
        onSuccess: async ({ txHash, ctx: { stepId } }) => {
          if (stepId !== STEP.deposit) return;
          let receivedShares: bigint | undefined;
          if (txHash) {
            try {
              const receipt = await core.publicClient.getTransactionReceipt({
                hash: txHash,
              });
              // `Deposited` is only emitted by sync deposits (USDC/USDT). For
              // async deposits this returns an empty array and `receivedShares`
              // stays undefined. Using SYNC_DEPOSIT_QUEUE_ABI directly gives
              // typed `log.args` without casting
              const claimedLog = parseEventLogs({
                abi: SYNC_DEPOSIT_QUEUE_ABI,
                logs: receipt.logs,
                eventName: 'Deposited',
              }).find(
                (log) =>
                  log.args.account.toLowerCase() === address.toLowerCase(),
              );
              receivedShares = claimedLog?.args.shares;
            } catch {
              // ignore, show fallback title
            }
          }
          txModalStages.success(amount, token, txHash, receivedShares);
          if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
        },
        onMultisigDone: ({ ctx }) => {
          if (ctx.stepId === STEP.deposit) txModalStages.successMultisig();
        },
        onFailure: async ({ error, ctx }) => {
          console.error(error);
          // An approval landed but the deposit was never sent (its estimate
          // or signature failed, or the approval's follow-up read did). Not
          // a completed deposit, whatever the error says: the user must learn
          // the funds are safe and a retry continues with the deposit, which
          // re-reads the allowance and skips the approval
          // A settled reset alone is not an approval: the message would
          // claim an allowance that is still zero; a retry reads it and
          // approves from there
          const isInterruptedAfterApprove =
            isStepSettled(ctx, STEP.approve) && !isStepSent(ctx, STEP.deposit);
          txModalStages.failed(
            isInterruptedAfterApprove
              ? new TxFlowInterruptedError(
                  ErrorMessage.DEPOSIT_INTERRUPTED,
                  error instanceof TxSettledError ? error.cause : error,
                )
              : error,
            onRetry,
          );
        },
      });

      // deposited (or proposed to a multisig): the form resets
      return isSuccess;
    },
    [
      address,
      core,
      depositQueueGetter,
      refetchScope,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      txFlow,
      txModalStages,
    ],
  );

  return { deposit };
};
