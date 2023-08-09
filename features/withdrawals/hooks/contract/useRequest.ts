import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useWeb3 } from 'reef-knot/web3-react';
import {
  useSDK,
  useSTETHContractRPC,
  useWSTETHContractRPC,
} from '@lido-sdk/react';
import { TOKENS, getWithdrawalQueueAddress } from '@lido-sdk/constants';
import { useAccount } from 'wagmi';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import {
  GatherPermitSignatureResult,
  useERC20PermitSignature,
} from 'shared/hooks';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { useWithdrawalsContract } from './useWithdrawalsContract';
import { useApprove } from 'shared/hooks/useApprove';
import { Zero } from '@ethersproject/constants';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

// this encapsulates permit/approval & steth/wsteth flows
const useWithdrawalRequestMethods = () => {
  const { providerWeb3 } = useSDK();
  const { account, chainId, contractWeb3 } = useWithdrawalsContract();
  const { dispatchModalState } = useTransactionModal();
  const permitSteth = useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests: BigNumber[];
    }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(signature, 'must have signature');
      invariant(contractWeb3, 'must have contractWeb3');

      dispatchModalState({ type: 'signing' });

      const params = [
        requests,
        signature.owner,
        {
          value: signature.value,
          deadline: signature.deadline,
          v: signature.v,
          r: signature.r,
          s: signature.s,
        },
      ] as const;

      const feeData = await contractWeb3.provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
      const gasLimit =
        await contractWeb3.estimateGas.requestWithdrawalsWithPermit(...params, {
          maxFeePerGas,
          maxPriorityFeePerGas,
        });

      const txOptions = {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit,
      };

      const callback = () =>
        contractWeb3.requestWithdrawalsWithPermit(...params, txOptions);

      const transaction = await runWithTransactionLogger(
        'Request signing',
        callback,
      );

      dispatchModalState({ type: 'block', txHash: transaction.hash });
      await runWithTransactionLogger('Request block confirmation', async () =>
        transaction.wait(),
      );
    },
    [account, chainId, contractWeb3, dispatchModalState],
  );

  const permitWsteth = useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests: BigNumber[];
    }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(signature, 'must have signature');
      invariant(contractWeb3, 'must have contractWeb3');

      const params = [
        requests,
        signature.owner,
        {
          value: signature.value,
          deadline: signature.deadline,
          v: signature.v,
          r: signature.r,
          s: signature.s,
        },
      ] as const;

      const feeData = await contractWeb3.provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
      const gasLimit =
        await contractWeb3.estimateGas.requestWithdrawalsWstETHWithPermit(
          ...params,
          {
            maxFeePerGas,
            maxPriorityFeePerGas,
          },
        );

      const txOptions = {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit,
      };

      const callback = () =>
        contractWeb3.requestWithdrawalsWstETHWithPermit(...params, txOptions);

      dispatchModalState({ type: 'signing' });

      const transaction = await runWithTransactionLogger(
        'Stake signing',
        callback,
      );

      dispatchModalState({ type: 'block', txHash: transaction.hash });
      await runWithTransactionLogger('Stake block confirmation', async () =>
        transaction.wait(),
      );
    },
    [account, chainId, contractWeb3, dispatchModalState],
  );

  const steth = useCallback(
    async ({ requests }: { requests: BigNumber[] }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(contractWeb3, 'must have contractWeb3');
      invariant(providerWeb3, 'must have providerWeb3');

      dispatchModalState({ type: 'signing' });
      const isMultisig = await isContract(account, contractWeb3.provider);

      const params = [requests, account] as const;

      const callback = async () => {
        if (isMultisig) {
          const tx = await contractWeb3.populateTransaction.requestWithdrawals(
            ...params,
          );
          return providerWeb3?.getSigner().sendUncheckedTransaction(tx);
        } else {
          const feeData = await contractWeb3.provider.getFeeData();
          const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
          const maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas ?? undefined;
          const gasLimit = await contractWeb3.estimateGas.requestWithdrawals(
            ...params,
            {
              maxFeePerGas,
              maxPriorityFeePerGas,
            },
          );
          return contractWeb3.requestWithdrawals(...params, {
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasLimit,
          });
        }
      };

      const transaction = await runWithTransactionLogger(
        'Request signing',
        callback,
      );
      const isTransaction = typeof transaction !== 'string';

      if (!isMultisig && isTransaction) {
        dispatchModalState({ type: 'block', txHash: transaction.hash });
        await runWithTransactionLogger('Request block confirmation', async () =>
          transaction.wait(),
        );
      }
    },
    [account, chainId, contractWeb3, dispatchModalState, providerWeb3],
  );

  const wstETH = useCallback(
    async ({ requests }: { requests: BigNumber[] }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(contractWeb3, 'must have contractWeb3');
      invariant(providerWeb3, 'must have providerWeb3');
      const isMultisig = await isContract(account, contractWeb3.provider);

      dispatchModalState({ type: 'signing' });

      const params = [requests, account] as const;
      const callback = async () => {
        if (isMultisig) {
          const tx =
            await contractWeb3.populateTransaction.requestWithdrawalsWstETH(
              requests,
              account,
            );
          return providerWeb3?.getSigner().sendUncheckedTransaction(tx);
        } else {
          const feeData = await contractWeb3.provider.getFeeData();
          const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
          const maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas ?? undefined;
          const gasLimit =
            await contractWeb3.estimateGas.requestWithdrawalsWstETH(...params, {
              maxFeePerGas,
              maxPriorityFeePerGas,
            });
          return contractWeb3.requestWithdrawalsWstETH(...params, {
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasLimit,
          });
        }
      };

      const transaction = await runWithTransactionLogger(
        'Stake signing',
        callback,
      );

      const isTransaction = typeof transaction !== 'string';

      if (!isMultisig && isTransaction) {
        dispatchModalState({ type: 'block', txHash: transaction.hash });
        await runWithTransactionLogger('Request block confirmation', async () =>
          transaction.wait(),
        );
      }
    },
    [account, chainId, contractWeb3, dispatchModalState, providerWeb3],
  );

  return useCallback(
    (isAllowance: boolean, token: TOKENS.STETH | TOKENS.WSTETH) => {
      return token == TOKENS.STETH
        ? isAllowance
          ? steth
          : permitSteth
        : isAllowance
        ? wstETH
        : permitWsteth;
    },
    [permitSteth, permitWsteth, steth, wstETH],
  );
};

// provides form with a handler to call signing flow
// and all needed indicators for ux

type useWithdrawalRequestParams = {
  amount: BigNumber | null;
  token: TOKENS.STETH | TOKENS.WSTETH;
};

export const useWithdrawalRequest = ({
  amount,
  token,
}: useWithdrawalRequestParams) => {
  const { chainId } = useSDK();
  const withdrawalQueueAddress = getWithdrawalQueueAddress(chainId);

  const { connector } = useAccount();
  const { account } = useWeb3();
  const { isBunker } = useWithdrawals();
  const { dispatchModalState } = useTransactionModal();
  const getRequestMethod = useWithdrawalRequestMethods();
  const [isMultisig, isMultisigLoading] = useIsMultisig();

  const wstethContract = useWSTETHContractRPC();
  const stethContract = useSTETHContractRPC();
  const tokenContract = token === TOKENS.STETH ? stethContract : wstethContract;

  const valueBN = amount ?? Zero;

  // TODO  split into async callback and pauseable SWR
  const {
    approve,
    needsApprove,
    allowance,
    loading: loadingUseApprove,
  } = useApprove(
    valueBN,
    tokenContract.address,
    withdrawalQueueAddress,
    account ?? undefined,
  );

  const { gatherPermitSignature } = useERC20PermitSignature({
    tokenProvider: tokenContract,
    spender: withdrawalQueueAddress,
  });

  const isApprovalFlow =
    connector?.id === 'walletConnect' ||
    isMultisig ||
    (allowance.gt(BigNumber.from(0)) && !needsApprove);

  const isApprovalFlowLoading =
    isMultisigLoading || (isApprovalFlow && loadingUseApprove);

  const isTokenLocked = isApprovalFlow && needsApprove;

  const request = useCallback(
    async (
      requests: BigNumber[] | null,
      amount: BigNumber | null,
      token: TokensWithdrawable,
    ) => {
      // define and set retry point
      try {
        invariant(
          requests && request.length > 0,
          'cannot submit empty requests',
        );
        invariant(amount, 'cannot submit empty amount');
        if (isBunker) {
          const bunkerDialogResult = await new Promise<boolean>((resolve) => {
            dispatchModalState({
              type: 'bunker',
              onCloseBunker: () => resolve(false),
              onOkBunker: () => resolve(true),
            });
          });
          if (!bunkerDialogResult) return { success: false };
        }
        // we can't know if tx was successful or even wait for it  with multisig
        // so we exit flow gracefully and reset UI
        const shouldSkipSuccess = isMultisig;
        // get right method
        const method = getRequestMethod(isApprovalFlow, token);
        // start flow
        dispatchModalState({
          type: 'start',
          flow: isApprovalFlow
            ? needsApprove
              ? TX_STAGE.APPROVE
              : TX_STAGE.SIGN
            : TX_STAGE.PERMIT,
          requestAmount: amount,
          token,
        });

        // each flow switches needed signing stages
        if (isApprovalFlow) {
          if (needsApprove) {
            await approve();
            // multisig does not move to next tx
            if (!isMultisig) await method({ requests });
          } else {
            await method({ requests });
          }
        } else {
          const signature = await gatherPermitSignature(amount);
          await method({ signature, requests });
        }
        // end flow
        dispatchModalState({ type: shouldSkipSuccess ? 'reset' : 'success' });
        return { success: true };
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        dispatchModalState({ type: 'error', errorText: errorMessage });
        return { success: false, error: error };
      }
    },
    [
      approve,
      dispatchModalState,
      gatherPermitSignature,
      getRequestMethod,
      isApprovalFlow,
      isBunker,
      isMultisig,
      needsApprove,
    ],
  );

  return {
    isTokenLocked,
    isApprovalFlow,
    allowance,
    isApprovalFlowLoading,
    request,
  };
};
