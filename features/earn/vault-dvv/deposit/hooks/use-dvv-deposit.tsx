import { useCallback } from 'react';
import { encodeFunctionData, getContract, WalletClient } from 'viem';
import invariant from 'tiny-invariant';

import {
  useDappStatus,
  useTxFlow,
  Erc20AllowanceAbi,
  AACall,
  useLidoSDK,
  applyRoundUpGasLimit,
} from 'modules/web3';
import { getTokenAddress } from 'config/networks/token-address';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { getReferralAddress } from 'utils/get-referral-address';
import { LIDO_ADDRESS } from 'config/groups/stake';

import type { DVVDepositFormValidatedValues } from '../types';
import {
  getDVVDepositWrapperWritableContract,
  getDVVaultWritableContract,
} from '../../contracts';
import { useTxModalStagesDVVDeposit } from './use-dvv-deposit-tx-modal';

export const useDVVDeposit = (onRetry?: () => void) => {
  const { address } = useDappStatus();
  const { core, wrap } = useLidoSDK();
  const { txModalStages } = useTxModalStagesDVVDeposit();
  const txFlow = useTxFlow();

  const depositDVV = useCallback(
    async ({ amount, token, referral }: DVVDepositFormValidatedValues) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvDepositStart);
      invariant(address, 'needs address');
      const tokenAddress = getTokenAddress(core.chainId, token);
      // used as substitute for ETH in previewDeposit
      const wethAddress = getTokenAddress(core.chainId, 'wETH');
      invariant(tokenAddress, 'Token address is not defined');
      invariant(wethAddress, 'WETH address is not defined');

      try {
        const vault = getDVVaultWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );
        const wrapper = getDVVDepositWrapperWritableContract(
          core.rpcProvider,
          core.web3Provider as WalletClient,
        );

        const tokenContract = getContract({
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
          LIDO_ADDRESS,
        );

        // used to display in modal
        const wstethAmount = await wrap.convertStethToWsteth(amount);
        const willReceiveDvsteth = await vault.read.previewDeposit([
          wstethAmount,
        ]);

        // determines:
        // - if approve tx/call to be used, after approve tx(or if included in AA call) set to false
        // - if to show approve or main tx modals
        let needsApprove = false;

        if (token !== 'ETH') {
          const allowance = await tokenContract.read.allowance([
            address,
            vault.address,
          ]);

          needsApprove = allowance < amount;
        }

        const approveArgs = [wrapper.address, amount] as const;
        // for ETH token address is 0xee..ee
        const depositArgs = [
          tokenAddress, // token to deposit weth or eth
          amount, // amount not counted for eth but pass for better analytics
          vault.address,
          address, // receiver
          referralAddress, // referral
        ] as const;
        const depositValue = token === 'ETH' ? amount : 0n;

        await txFlow({
          callsFn: async () => {
            const calls: AACall[] = [];
            if (needsApprove) {
              calls.push({
                to: tokenAddress,
                data: encodeFunctionData({
                  abi: tokenContract.abi,
                  functionName: 'approve',
                  args: approveArgs,
                }),
              });
            }
            calls.push({
              to: wrapper.address,
              data: encodeFunctionData({
                abi: wrapper.abi,
                functionName: 'deposit',
                args: depositArgs,
              }),
              value: depositValue,
            });

            needsApprove = false;

            return calls;
          },
          sendTransaction: async (txStagesCallback) => {
            if (needsApprove) {
              await core.performTransaction({
                getGasLimit: (opts) =>
                  tokenContract.estimateGas.approve(approveArgs, opts),
                sendTransaction: (opts) => {
                  return tokenContract.write.approve(approveArgs, opts);
                },
                callback: txStagesCallback,
              });
            }
            needsApprove = false;
            await core.performTransaction({
              getGasLimit: async (opts) =>
                applyRoundUpGasLimit(
                  await wrapper.estimateGas.deposit(depositArgs, {
                    ...opts,
                    value: depositValue,
                  }),
                ),
              sendTransaction: (opts) => {
                return wrapper.write.deposit(depositArgs, {
                  ...opts,
                  value: depositValue,
                });
              },
              callback: txStagesCallback,
            });
          },
          onSign: async () => {
            if (needsApprove) {
              return txModalStages.signApproval(amount, token);
            }
            return txModalStages.sign(amount, willReceiveDvsteth, token);
          },
          onReceipt: async ({ txHashOrCallId, isAA }) => {
            if (needsApprove) {
              return txModalStages.pendingApproval(
                amount,
                token,
                txHashOrCallId,
              );
            }
            return txModalStages.pending(
              amount,
              willReceiveDvsteth,
              token,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            if (needsApprove) return;
            const balance = await vault.read.balanceOf([address]);
            txModalStages.success(balance, txHash);
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.dvvDepositFinish);
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
    [address, core, onRetry, txFlow, txModalStages, wrap],
  );

  return { depositDVV };
};
