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
import { LIDO_ADDRESS } from 'config/groups/stake';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { getReferralAddress } from 'utils/get-referral-address';

import { GGVDepositFormValidatedValues } from '../form-context/types';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVTellerWritableContract,
  getGGVVaultContract,
} from '../../contracts';
import { useTxModalStagesGGVDeposit } from './use-ggv-deposit-tx-modal';
import { useHonk } from './use-honk';

export const useGGVDeposit = (onRetry?: () => void) => {
  const { honk } = useHonk();
  const { address } = useDappStatus();
  const { core } = useLidoSDK();
  const { txModalStages } = useTxModalStagesGGVDeposit();
  const txFlow = useTxFlow();

  const depositGGV = useCallback(
    async ({ amount, token, referral }: GGVDepositFormValidatedValues) => {
      trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDepositStart);
      invariant(address, 'needs address');
      const tokenAddress = getTokenAddress(core.chainId, token);
      // used as substitute for ETH in previewDeposit
      const wethAddress = getTokenAddress(core.chainId, 'wETH');
      invariant(tokenAddress, 'Token address is not defined');
      invariant(wethAddress, 'WETH address is not defined');

      try {
        const vault = getGGVVaultContract(core.rpcProvider);
        const lens = getGGVLensContract(core.rpcProvider);
        const accountant = getGGVAccountantContract(core.rpcProvider);
        const teller = getGGVTellerWritableContract(
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
        const willReceive = await lens.read.previewDeposit([
          token === 'ETH' ? wethAddress : tokenAddress,
          amount,
          vault.address,
          accountant.address,
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

        const approveArgs = [vault.address, amount] as const;
        // for ETH token address is 0xee..ee
        const depositArgs = [
          tokenAddress,
          amount,
          0n,
          referralAddress,
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
              to: teller.address,
              data: encodeFunctionData({
                abi: teller.abi,
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
                  await teller.estimateGas.deposit(depositArgs, {
                    ...opts,
                    value: depositValue,
                  }),
                ),
              sendTransaction: (opts) => {
                return teller.write.deposit(depositArgs, {
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
            return txModalStages.sign(amount, willReceive, token);
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
              willReceive,
              token,
              txHashOrCallId,
              isAA,
            );
          },
          onSuccess: async ({ txHash }) => {
            if (needsApprove) return;
            const balance = await vault.read.balanceOf([address]);
            honk();
            txModalStages.success(balance, txHash);
            trackMatomoEvent(MATOMO_EARN_EVENTS_TYPES.ggvDepositFinish);
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
    [address, core, honk, onRetry, txFlow, txModalStages],
  );

  return { depositGGV };
};
