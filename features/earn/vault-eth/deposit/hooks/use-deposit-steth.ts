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
import { TOKENS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';

import { getSyncDepositQueueWritableContract } from '../../contracts';
import { useTxModalStagesDeposit } from 'modules/mellow-meta-vaults/hooks/use-deposit-tx-modal';
import { ETH_VAULT_TOKEN_SYMBOL } from '../../consts';

type Stage = 'steth-approve' | 'wrap' | 'wsteth-approve' | 'deposit';

type DepositStethArgs = {
  amount: bigint;
  referral: string | null;
};

export const useEthVaultDepositSteth = (onRetry?: () => void) => {
  const { txModalStages } = useTxModalStagesDeposit({
    stageOperationArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Requesting deposit for',
    },
    stageApproveArgs: {
      willReceiveToken: ETH_VAULT_TOKEN_SYMBOL,
      operationText: 'Unlocking',
    },
  });

  const { address } = useDappStatus();
  const { core, wrap } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({ amount, referral }: DepositStethArgs) => {
      invariant(address, 'needs address');

      const stethAddress = getTokenAddress(core.chainId, TOKENS.steth);
      const wstethAddress = getTokenAddress(core.chainId, TOKENS.wsteth);
      invariant(stethAddress, 'stETH address not defined');
      invariant(wstethAddress, 'wstETH address not defined');

      try {
        const depositQueue = getSyncDepositQueueWritableContract({
          publicClient: core.rpcProvider,
          walletClient: core.web3Provider as WalletClient,
          token: TOKENS.wsteth,
        });

        const stethContract = getContract({
          address: stethAddress,
          abi: Erc20AllowanceAbi,
          client: {
            public: core.rpcProvider,
            wallet: core.web3Provider as WalletClient,
          },
        });

        const wstethContract = getContract({
          address: wstethAddress,
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

        // Pre-calculate expected wstETH amount for allowance check and deposit call
        const wstethAmount = await wrap.convertStethToWsteth(amount);

        const [stethAllowance, wstethAllowance] = await Promise.all([
          stethContract.read.allowance([address, wstethAddress]),
          wstethContract.read.allowance([address, depositQueue.address]),
        ]);

        let needsStethApprove = stethAllowance < amount;
        let needsWstethApprove = wstethAllowance < wstethAmount;

        // Stage tracking for tx modal UI
        let currentStage: Stage = needsStethApprove ? 'steth-approve' : 'wrap';

        const stethApproveArgs = [wstethAddress, amount] as const;
        const wstethApproveArgs = [depositQueue.address, wstethAmount] as const;
        const depositArgs = [wstethAmount, referralAddress, []] as const;

        await txFlow({
          callsFn: async () => {
            const calls: (AACall | false)[] = [];

            if (needsStethApprove) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const approveStethCall =
                await (wrap.approveStethForWrapPopulateTx({
                  value: amount,
                }) as Promise<AACall>);
              calls.push(approveStethCall);
            }

            const wrapCall = await (wrap.wrapStethPopulateTx({
              value: amount,
            }) as Promise<AACall>);
            calls.push(wrapCall);

            if (needsWstethApprove) {
              calls.push({
                to: wstethAddress,
                data: encodeFunctionData({
                  abi: wstethContract.abi,
                  functionName: 'approve',
                  args: wstethApproveArgs,
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
            });

            // For AA all steps are batched; treat as single deposit stage
            needsStethApprove = false;
            needsWstethApprove = false;
            currentStage = 'deposit';

            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            // Step 1: Approve stETH for wstETH wrap contract (if needed)
            if (needsStethApprove) {
              await core.performTransaction({
                getGasLimit: (opts) =>
                  stethContract.estimateGas.approve(stethApproveArgs, opts),
                sendTransaction: (opts) =>
                  stethContract.write.approve(stethApproveArgs, opts),
                callback: txStagesCallback,
              });
              needsStethApprove = false;
              currentStage = 'wrap';
            }

            // Step 2: Wrap stETH → wstETH
            await wrap.wrapSteth({ value: amount, callback: txStagesCallback });
            currentStage = needsWstethApprove ? 'wsteth-approve' : 'deposit';

            // Step 3: Approve wstETH for deposit queue (if needed)
            if (needsWstethApprove) {
              await core.performTransaction({
                getGasLimit: (opts) =>
                  wstethContract.estimateGas.approve(wstethApproveArgs, opts),
                sendTransaction: (opts) =>
                  wstethContract.write.approve(wstethApproveArgs, opts),
                callback: txStagesCallback,
              });
              needsWstethApprove = false;
              currentStage = 'deposit';
            }

            // Step 4: Deposit wstETH into queue
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpTxParameter(
                  await depositQueue.estimateGas.deposit(depositArgs, opts),
                ),
              sendTransaction: (opts) =>
                depositQueue.write.deposit(depositArgs, opts),
              callback: txStagesCallback,
            });
          },
          onSign: () => {
            switch (currentStage) {
              case 'steth-approve':
                return txModalStages.signApproval(amount, TOKENS.steth);
              case 'wrap':
                return txModalStages.signWrap(amount, TOKENS.steth);
              case 'wsteth-approve':
                return txModalStages.signApproval(wstethAmount, TOKENS.wsteth);
              case 'deposit':
                return txModalStages.sign(wstethAmount, TOKENS.wsteth);
            }
          },
          onReceipt: ({ txHashOrCallId, isAA }) => {
            switch (currentStage) {
              case 'steth-approve':
                return txModalStages.pendingApproval(
                  amount,
                  TOKENS.steth,
                  txHashOrCallId,
                );
              case 'wrap':
                return txModalStages.pendingWrap(
                  amount,
                  TOKENS.steth,
                  txHashOrCallId,
                );
              case 'wsteth-approve':
                return txModalStages.pendingApproval(
                  wstethAmount,
                  TOKENS.wsteth,
                  txHashOrCallId,
                );
              case 'deposit':
                return txModalStages.pending(
                  wstethAmount,
                  TOKENS.wsteth,
                  txHashOrCallId,
                  isAA,
                );
            }
          },
          onSuccess: async ({ txHash }) => {
            if (currentStage !== 'deposit') return;
            let receivedShares: bigint | undefined;
            if (txHash) {
              try {
                const receipt = await core.rpcProvider.getTransactionReceipt({
                  hash: txHash,
                });
                const claimedLog = parseEventLogs({
                  abi: depositQueue.abi,
                  logs: receipt.logs,
                  eventName: 'Deposited',
                }).find(
                  (log) =>
                    log.args.account?.toLowerCase() === address?.toLowerCase(),
                );
                receivedShares = claimedLog?.args.shares;
              } catch {
                // ignore, show fallback title
              }
            }
            txModalStages.success(
              wstethAmount,
              TOKENS.wsteth,
              txHash,
              receivedShares,
            );
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish);
          },
          onMultisigDone: () => {
            if (currentStage !== 'deposit') return;
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
    [address, core, onRetry, txFlow, txModalStages, wrap],
  );

  return { deposit };
};
