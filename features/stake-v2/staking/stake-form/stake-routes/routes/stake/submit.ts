import invariant from 'tiny-invariant';
import { encodeFunctionData, type Address } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { applyRoundUpTxParameter } from 'modules/web3';
import { getReferralAddress } from 'utils/get-referral-address';

import { getTokenAddressOrThrow } from '../../../../../utils';
import type { StakeRouteSubmitTools, StakeRouteValues } from '../../types';

import { unwrapWeth, unwrapWethCall } from './weth-unwrap';

// the steps of a stake, the first one only for WETH
const STEP = { unwrap: 'unwrap', stake: 'stake' } as const;

type StakeData = {
  referralAddress: Address;
};

const log = (stage: string, details: object) =>
  console.info(`[stake-v2] stake ${stage}`, details);

/**
 * L1 stake: Lido submit() with the referral, after a WETH unwrap for WETH.
 * No modals yet: the stages are logged. Resolves true when the stake landed
 * (or was proposed to a multisig).
 */
export const submitStake = async (
  { amount, tokenIn, referral }: StakeRouteValues,
  { txFlow, lidoSDK: { core, stake } }: StakeRouteSubmitTools,
): Promise<boolean> => {
  // the submit button only shows once the wallet is on the form's chain
  invariant(
    core.chainId === tokenIn.chainId,
    'the wallet must be on the chain of the stake',
  );
  const isWeth = tokenIn.token === TOKENS.weth;

  const { isSuccess } = await txFlow<StakeData>({
    prepare: async () => ({
      referralAddress: await getReferralAddress(referral, core.publicClient),
    }),
    // AA wallets get unwrap + submit in one batch, legacy ones one by one.
    // The submit is built without a gas estimate: for a WETH stake the ETH
    // only exists after the unwrap
    callsFn: async ({ data }) => [
      isWeth && {
        stepId: STEP.unwrap,
        ...unwrapWethCall(tokenIn.chainId, amount),
      },
      {
        stepId: STEP.stake,
        to: getTokenAddressOrThrow(tokenIn.chainId, TOKENS.steth),
        data: encodeFunctionData({
          abi: StethAbi,
          functionName: 'submit',
          args: [data.referralAddress],
        }),
        value: amount,
      },
    ],
    sendStep: async (step, callback, { data }) => {
      if (step.stepId === STEP.unwrap) {
        await unwrapWeth(core, amount, callback);
        return;
      }
      await stake.stakeEth({
        value: amount,
        callback,
        referralAddress: data.referralAddress,
      });
    },
    onSign: async ({ payload, ctx: { stepId } }) => {
      log('sign', { stepId, amount });
      if (stepId !== STEP.stake) return;
      return applyRoundUpTxParameter(payload ?? config.STAKE_GASLIMIT_FALLBACK);
    },
    onReceipt: ({ txHashOrCallId, ctx: { stepId } }) =>
      log('receipt', { stepId, txHashOrCallId }),
    onSuccess: ({ txHash, ctx: { stepId } }) =>
      log('success', { stepId, txHash }),
    onMultisigDone: ({ ctx: { stepId } }) => log('multisig', { stepId }),
    onFailure: ({ error, ctx: { stepId, status } }) =>
      console.warn('[stake-v2] stake failed', { stepId, status, error }),
  });

  return isSuccess;
};
