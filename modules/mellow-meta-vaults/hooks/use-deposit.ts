import { useCallback } from 'react';
import {
  encodeFunctionData,
  getContract,
  PublicClient,
  WalletClient,
} from 'viem';
import invariant from 'tiny-invariant';

import {
  AACall,
  applyRoundUpGasLimit,
  Erc20AllowanceAbi,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { getTokenAddress, TOKENS } from 'config/networks/token-address';
import { getReferralAddress } from 'utils/get-referral-address';
// import { Contract } from '../types/contract';
import { TxModalStages } from '../types/txModalStages';

type DepositQueueGetter<
  DepositToken extends string,
  TPublicClient extends PublicClient = PublicClient,
  TWalletClient extends WalletClient = WalletClient,
> = ({
  publicClient,
  walletClient,
  token,
}: {
  publicClient: TPublicClient;
  walletClient: TWalletClient;
  token: DepositToken;
}) => any; // TODO: fix any

export const useDeposit = <DepositToken extends string>({
  depositQueueGetter,
  txModalStages,
  onRetry,
}: {
  depositQueueGetter: DepositQueueGetter<DepositToken>;
  txModalStages: TxModalStages;
  onRetry?: () => void;
}) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const txFlow = useTxFlow();

  const deposit = useCallback(
    async ({
      amount,
      token,
      referral,
    }: {
      amount: bigint;
      token: DepositToken;
      referral: string | null;
    }) => {
      // TODO: trackMatomoEvent(strategyDepositingStart);
      invariant(address, 'needs address');
      const tokenAddress = getTokenAddress(core.chainId, token as TOKENS); // TODO: fix token type
      invariant(tokenAddress, 'Token address is not defined');

      try {
        const depositQueue = depositQueueGetter({
          publicClient: core.rpcProvider,
          walletClient: core.web3Provider as WalletClient,
          token,
        });

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

        if (token !== 'ETH') {
          const allowance = await depositTokenContract.read.allowance([
            address,
            depositQueue.address,
          ]);

          needsApprove = allowance < amount;
        }

        const approveArgs = [depositQueue.address, amount] as const;
        const depositArgs = [amount, referralAddress, []] as const;
        const msgValue = token === 'ETH' ? amount : 0n;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            if (needsApprove) {
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
                applyRoundUpGasLimit(
                  await depositQueue.estimateGas.deposit(depositArgs, {
                    ...opts,
                    value: msgValue,
                  }),
                ),
              sendTransaction: (opts) => {
                return depositQueue.write.deposit(depositArgs, {
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
            txModalStages.success(amount, token, txHash);
            // TODO: trackMatomoEvent();
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
    [address, core, depositQueueGetter, onRetry, txFlow, txModalStages],
  );

  return { deposit };
};
