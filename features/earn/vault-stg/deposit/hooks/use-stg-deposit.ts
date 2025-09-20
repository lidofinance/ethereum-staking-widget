import { useCallback } from 'react';
import { encodeFunctionData, getContract, WalletClient } from 'viem';
import invariant from 'tiny-invariant';

import { config } from 'config';
import {
  AACall,
  applyRoundUpGasLimit,
  Erc20AllowanceAbi,
  useDappStatus,
  useLidoSDK,
  useTxFlow,
} from 'modules/web3';
import { STGDepositFormValidatedValues } from '../form-context/types';
import { getTokenAddress } from 'config/networks/token-address';
import {
  getSTGDepositQueueWritableContract,
  getSTGShareManagerSTRETH,
} from '../../contracts';
import { useTxModalStagesSTGDeposit } from './use-stg-deposit-tx-modal';

export const useSTGDeposit = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesSTGDeposit();
  const txFlow = useTxFlow();

  const depositSTG = useCallback(
    async ({ amount, token }: STGDepositFormValidatedValues) => {
      // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.stgDepositStart);
      invariant(address, 'needs address');
      const tokenAddress = getTokenAddress(core.chainId, token);
      invariant(tokenAddress, 'Token address is not defined');

      try {
        const depositContract = getSTGDepositQueueWritableContract({
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

        const stgTokenSTRETH = getSTGShareManagerSTRETH(core.rpcProvider);

        let needsApprove = false;

        if (token !== 'ETH') {
          const allowance = await depositTokenContract.read.allowance([
            address,
            depositContract.address,
          ]);

          needsApprove = allowance < amount;
        }

        const approveArgs = [depositContract.address, amount] as const;
        const depositArgs = [
          amount,
          config.STAKE_FALLBACK_REFERRAL_ADDRESS,
          [],
        ] as const;
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
              to: depositContract.address,
              data: encodeFunctionData({
                abi: depositContract.abi,
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
                  await depositContract.estimateGas.deposit(depositArgs, {
                    ...opts,
                    value: msgValue,
                  }),
                ),
              sendTransaction: (opts) => {
                return depositContract.write.deposit(depositArgs, {
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
            const balance = await stgTokenSTRETH.read.balanceOf([address]);
            txModalStages.success(balance, txHash);
            // trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.stgDepositFinish);
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
    [address, core, onRetry, txFlow, txModalStages],
  );

  return { depositSTG };
};
