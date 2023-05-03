import { useCallback, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import { useWeb3 } from 'reef-knot/web3-react';
import { parseEther } from '@ethersproject/units';
import type { WstethAbi } from '@lido-sdk/contracts';
import { useSDK } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import {
  GatherPermitSignatureResult,
  useERC20PermitSignature,
  useIsContract,
} from 'shared/hooks';
import { useWithdrawalsApprove } from 'features/withdrawals/hooks';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { isContract } from 'utils/isContract';
import type { StethPermitAbi } from 'generated';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useRequestData } from 'features/withdrawals/contexts/request-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import type { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

import { useWithdrawalsContract } from './useWithdrawalsContract';

// this encapsulates permit/approval & steth/wsteth flows
const useWithdrawalRequestMethods = () => {
  const { providerWeb3 } = useSDK();
  const { account, chainId, contractWeb3 } = useWithdrawalsContract();
  const { updateData } = useRequestData();
  const { dispatchModalState } = useTransactionModal();

  const permitSteth = useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests?: BigNumber[];
    }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(signature, 'must have signature');
      invariant(requests, 'must have requests');
      invariant(contractWeb3, 'must have contractWeb3');

      dispatchModalState({ type: 'signing' });

      const callback = () =>
        contractWeb3.requestWithdrawalsWithPermit(requests, signature.owner, {
          value: signature.value,
          deadline: signature.deadline,
          v: signature.v,
          r: signature.r,
          s: signature.s,
        });

      const transaction = await runWithTransactionLogger(
        'Request signing',
        callback,
      );

      dispatchModalState({ type: 'block', txHash: transaction.hash });
      await runWithTransactionLogger('Request block confirmation', async () =>
        transaction.wait(),
      );
      await updateData();
    },
    [account, chainId, contractWeb3, dispatchModalState, updateData],
  );

  const permitWsteth = useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests?: BigNumber[];
    }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(signature, 'must have signature');
      invariant(requests, 'must have requests');
      invariant(contractWeb3, 'must have contractWeb3');

      const callback = () =>
        contractWeb3.requestWithdrawalsWstETHWithPermit(
          requests,
          signature.owner,
          {
            value: signature.value,
            deadline: signature.deadline,
            v: signature.v,
            r: signature.r,
            s: signature.s,
          },
        );
      dispatchModalState({ type: 'signing' });

      const transaction = await runWithTransactionLogger(
        'Stake signing',
        callback,
      );

      dispatchModalState({ type: 'block', txHash: transaction.hash });
      await runWithTransactionLogger('Stake block confirmation', async () =>
        transaction.wait(),
      );
      await updateData();
    },
    [account, chainId, contractWeb3, dispatchModalState, updateData],
  );

  const steth = useCallback(
    async ({ requests }: { requests?: BigNumber[] }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(requests, 'must have requests');
      invariant(contractWeb3, 'must have contractWeb3');
      invariant(providerWeb3, 'must have providerWeb3');

      dispatchModalState({ type: 'signing' });
      const isMultisig = await isContract(account, contractWeb3.provider);

      const callback = async () => {
        if (isMultisig) {
          const tx = await contractWeb3.populateTransaction.requestWithdrawals(
            requests,
            account,
          );
          return providerWeb3?.getSigner().sendUncheckedTransaction(tx);
        } else return contractWeb3.requestWithdrawals(requests, account);
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
      await updateData();
    },
    [
      account,
      chainId,
      contractWeb3,
      dispatchModalState,
      providerWeb3,
      updateData,
    ],
  );

  const wstETH = useCallback(
    async ({ requests }: { requests?: BigNumber[] }) => {
      invariant(chainId, 'must have chainId');
      invariant(account, 'must have account');
      invariant(requests, 'must have requests');
      invariant(contractWeb3, 'must have contractWeb3');
      invariant(providerWeb3, 'must have providerWeb3');
      const isMultisig = await isContract(account, contractWeb3.provider);

      dispatchModalState({ type: 'signing' });

      const callback = async () => {
        if (isMultisig) {
          const tx =
            await contractWeb3.populateTransaction.requestWithdrawalsWstETH(
              requests,
              account,
            );
          return providerWeb3?.getSigner().sendUncheckedTransaction(tx);
        } else return contractWeb3.requestWithdrawalsWstETH(requests, account);
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
      await updateData();
    },
    [
      account,
      chainId,
      contractWeb3,
      dispatchModalState,
      providerWeb3,
      updateData,
    ],
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

type useWithdrawalRequestOptions = {
  value: string;
  tokenContract: StethPermitAbi | WstethAbi | null;
  token: TokensWithdrawable;
};

// provides form with a handler to call signing flow
// and all needed indicators for ux
export const useWithdrawalRequest = ({
  value,
  tokenContract,
  token,
}: useWithdrawalRequestOptions) => {
  const [isTxPending, setIsTxPending] = useState(false);
  const { account } = useWeb3();
  const { isBunker } = useWithdrawals();
  const { contractWeb3: withdrawalContractWeb3 } = useWithdrawalsContract();
  const { dispatchModalState } = useTransactionModal();
  const getRequestMethod = useWithdrawalRequestMethods();
  const { isContract: isMultisig, loading: isMultisigLoading } = useIsContract(
    account ?? undefined,
  );

  const valueBN = useMemo(() => {
    try {
      return parseEther(value ? value : '0');
    } catch {
      return BigNumber.from(0);
    }
  }, [value]);

  // TODO  split into async callback and pauseable SWR
  const {
    approve,
    needsApprove,
    allowance,
    loading: loadingUseApprove,
  } = useWithdrawalsApprove(
    valueBN,
    tokenContract?.address ?? '',
    withdrawalContractWeb3?.address ?? '',
    account ?? undefined,
  );

  // TODO streamline from hook to async callback
  const { gatherPermitSignature } = useERC20PermitSignature({
    value,
    tokenProvider: tokenContract,
    spender: withdrawalContractWeb3?.address ?? '',
  });

  const isApprovalFlow =
    isMultisig || (allowance.gt(BigNumber.from(0)) && !needsApprove);

  const isApprovalFlowLoading =
    isMultisigLoading || (isApprovalFlow && loadingUseApprove);
  const isTokenLocked = isApprovalFlow && needsApprove;

  const request = useCallback(
    (requests: BigNumber[], resetForm: () => void) => {
      // define and set retry point
      const startCallback = async () => {
        try {
          setIsTxPending(true);
          const requestAmount = requests.reduce(
            (s, r) => s.add(r),
            BigNumber.from(0),
          );
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
            requestAmount,
            token,
          });

          // each flow switches needed signing stages
          if (isApprovalFlow) {
            if (needsApprove) {
              await approve();
              // multisig exits the flow here
              if (!isMultisig) {
                await method({ requests });
              }
            } else {
              await method({ requests });
            }
          } else {
            const signature = await gatherPermitSignature();
            await method({ signature, requests });
          }
          // end flow
          dispatchModalState({ type: 'success' });
          resetForm();
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          dispatchModalState({ type: 'error', errorText: errorMessage });
        } finally {
          setIsTxPending(false);
        }
      };
      dispatchModalState({
        type: 'set_starTx_callback',
        callback: startCallback,
      });
      if (isBunker) {
        // for bunker mode the warning is shown and start is deferred
        dispatchModalState({ type: 'bunker' });
      } else startCallback();
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
      setIsTxPending,
      token,
    ],
  );

  return {
    isTokenLocked,
    isApprovalFlow,
    allowance,
    isApprovalFlowLoading,
    request,
    isTxPending,
  };
};
