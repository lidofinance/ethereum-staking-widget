import { useCallback } from 'react';
import {
  encodeFunctionData,
  getContract,
  parseEventLogs,
  WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';

import {
  AACall,
  applyRoundUpTxParameter,
  Erc20AllowanceAbi,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { getTokenAddress } from 'config/networks/token-address';
import { getReferralAddress } from 'utils/get-referral-address';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { type Token, TOKENS } from 'consts/tokens';
import { MATOMO_EVENT_TYPE } from 'consts/matomo';
import { SYNC_DEPOSIT_QUEUE_ABI } from '../abi';
import { TxModalStages } from '../types/tx-modal-stages';
import { DepositQueueGetter } from '../types/deposit-queue-getter';
import { SyncDepositQueueWritableContract } from '../types/contracts';

type DepositArgs = {
  amount: bigint;
  token: Token;
  referral: string | null;
};

export const useDeposit = <DepositQueueToken extends string>({
  depositQueueGetter,
  txModalStages,
  onRetry,
  matomoEventStart,
  matomoEventSuccess,
}: {
  depositQueueGetter: DepositQueueGetter<DepositQueueToken>;
  txModalStages: TxModalStages;
  onRetry?: () => void;
  matomoEventStart?: MATOMO_EVENT_TYPE;
  matomoEventSuccess?: MATOMO_EVENT_TYPE;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({ amount, token, referral }: DepositArgs) => {
      if (matomoEventStart) trackMatomoEvent(matomoEventStart);
      invariant(address, 'needs address');
      const tokenAddress = getTokenAddress(core.chainId, token);
      invariant(tokenAddress, 'Token address is not defined');

      try {
        const depositQueue = depositQueueGetter({
          publicClient: core.rpcProvider,
          walletClient: core.web3Provider as WalletClient,
          token: token as DepositQueueToken,
        });
        // Both async and sync deposit queue ABIs expose an identical `deposit(assets, referral, merkleProof)`
        // signature. Casting to the sync variant gives accurate call-site types while avoiding the
        // uncallable union that TypeScript produces when `depositQueue` is `Async | Sync`.
        const depositFn = depositQueue.write
          .deposit as SyncDepositQueueWritableContract['write']['deposit'];
        const estimateDepositGasFn = depositQueue.estimateGas
          .deposit as SyncDepositQueueWritableContract['estimateGas']['deposit'];

        const depositTokenContract = getContract({
          address: tokenAddress,
          abi: Erc20AllowanceAbi,
          client: {
            public: core.rpcProvider,
            wallet: core.web3Provider as WalletClient,
          },
        });

        const referralAddress = await getReferralAddress(
          referral,
          core.rpcProvider,
        );

        let needsApprove = false;
        // some tokens (like USDT) require resetting approval to 0 before setting it to a new value
        let needsApprovalReset = false;

        if (token !== TOKENS.eth) {
          const allowance = await depositTokenContract.read.allowance([
            address,
            depositQueue.address,
          ]);

          needsApprove = allowance < amount;

          needsApprovalReset =
            token === TOKENS.usdt && needsApprove && allowance > 0n;
        }

        const approveArgs = [depositQueue.address, amount] as const;
        const resetApproveArgs = [depositQueue.address, 0n] as const;
        const depositArgs = [amount, referralAddress, []] as const;
        const msgValue = token === TOKENS.eth ? amount : 0n;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];

            if (needsApprove) {
              if (needsApprovalReset) {
                calls.push({
                  to: tokenAddress,
                  data: encodeFunctionData({
                    abi: depositTokenContract.abi,
                    functionName: 'approve',
                    args: resetApproveArgs,
                  }),
                });
              }

              calls.push({
                to: tokenAddress,
                data: encodeFunctionData({
                  abi: depositTokenContract.abi,
                  functionName: 'approve',
                  args: approveArgs,
                }),
              });
            }
            calls.push({
              to: depositQueue.address,
              data: encodeFunctionData({
                abi: depositQueue.abi,
                functionName: 'deposit',
                args: depositArgs,
              }),
              value: msgValue,
            });

            needsApprove = false;

            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsApprove) {
              if (needsApprovalReset) {
                await core.performTransaction({
                  getGasLimit: (opts) =>
                    depositTokenContract.estimateGas.approve(
                      resetApproveArgs,
                      opts,
                    ),
                  sendTransaction: (opts) => {
                    return depositTokenContract.write.approve(
                      resetApproveArgs,
                      opts,
                    );
                  },
                  callback: txStagesCallback,
                });
                needsApprovalReset = false;
              }

              await core.performTransaction({
                getGasLimit: (opts) =>
                  depositTokenContract.estimateGas.approve(approveArgs, opts),
                sendTransaction: (opts) => {
                  return depositTokenContract.write.approve(approveArgs, opts);
                },
                callback: txStagesCallback,
              });
            }
            needsApprove = false;
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
                  await estimateDepositGasFn(depositArgs, {
                    ...opts,
                    value: msgValue,
                  }),
                ),
              sendTransaction: (opts) => {
                return depositFn(depositArgs, {
                  ...opts,
                  value: msgValue,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: () => {
            if (needsApprove) {
              return txModalStages.signApproval(amount, token);
            }
            return txModalStages.sign(amount, token);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            if (needsApprove) {
              return txModalStages.pendingApproval(
                amount,
                token,
                txHashOrCallId,
              );
            }
            return txModalStages.pending(amount, token, txHashOrCallId, isAA);
          },
          onSuccess: async ({ txHash }) => {
            if (needsApprove) return;
            let receivedShares: bigint | undefined;
            if (txHash) {
              try {
                const receipt = await core.rpcProvider.getTransactionReceipt({
                  hash: txHash,
                });
                // `Deposited` is only emitted by sync deposits (USDC/USDT). For async deposits
                // this returns an empty array and `receivedShares` stays undefined.
                // Using SYNC_DEPOSIT_QUEUE_ABI directly gives typed `log.args` without casting.
                const claimedLog = parseEventLogs({
                  abi: SYNC_DEPOSIT_QUEUE_ABI,
                  logs: receipt.logs,
                  eventName: 'Deposited',
                }).find(
                  (log) =>
                    log.args.account.toLowerCase() === address?.toLowerCase(),
                );
                receivedShares = claimedLog?.args.shares;
              } catch {
                // ignore, show fallback title
              }
            }
            txModalStages.success(amount, token, txHash, receivedShares);
            if (matomoEventSuccess) trackMatomoEvent(matomoEventSuccess);
          },
          onMultisigDone: () => {
            if (needsApprove) return;
            txModalStages.successMultisig();
          },
        });
        return true;
      } catch (error) {
        console.error(error);
        txModalStages.failed(error, onRetry);
        return false;
      }
    },
    [
      address,
      core,
      depositQueueGetter,
      matomoEventStart,
      matomoEventSuccess,
      onRetry,
      txFlow,
      txModalStages,
    ],
  );

  return { deposit };
};
