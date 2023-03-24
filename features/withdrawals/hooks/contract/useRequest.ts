import { useCallback } from 'react';
import { BigNumber } from 'ethers';

import { TX_STAGE } from 'features/withdrawals/shared/tx-stage-modal';
import { GatherPermitSignatureResult } from 'shared/hooks';
import { useRequestData, useRequestTxModal } from 'features/withdrawals/hooks';
import { getErrorMessage, runWithTransactionLogger } from 'utils';

import { useWithdrawalsContract } from './useWithdrawalsContract';

export const useWithdrawalsPermitStETH = () => {
  const { account, chainId, contractWeb3 } = useWithdrawalsContract();
  const { updateData } = useRequestData();
  const {
    setTxHash,
    setTxStage,
    openTxModal,
    setRequestAmount,
    setTxModalFailedText,
    setTokenName,
  } = useRequestTxModal();

  return useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests?: BigNumber[];
    }) => {
      if (!chainId || !account || !signature || !requests || !contractWeb3)
        return;

      setRequestAmount(signature.value);
      setTokenName('stETH');

      const callback = () =>
        contractWeb3.requestWithdrawalsWithPermit(requests, signature.owner, {
          value: signature.value,
          deadline: signature.deadline,
          v: signature.v,
          r: signature.r,
          s: signature.s,
        });

      setTxStage(TX_STAGE.SIGN);
      openTxModal();

      try {
        const transaction = await runWithTransactionLogger(
          'Request signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();

        await runWithTransactionLogger('Request block confirmation', async () =>
          transaction.wait(),
        );
        await updateData();

        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        setTxModalFailedText(errorMessage);
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        setTokenName('');
        openTxModal();
      }
    },
    [
      account,
      chainId,
      contractWeb3,
      openTxModal,
      setRequestAmount,
      setTokenName,
      setTxHash,
      setTxModalFailedText,
      setTxStage,
      updateData,
    ],
  );
};

export const useWithdrawalsPermitWstETH = () => {
  const { account, chainId, contractWeb3 } = useWithdrawalsContract();
  const { updateData } = useRequestData();
  const {
    setTxHash,
    setTxStage,
    openTxModal,
    setRequestAmount,
    setTxModalFailedText,
    setTokenName,
  } = useRequestTxModal();

  return useCallback(
    async ({
      signature,
      requests,
    }: {
      signature?: GatherPermitSignatureResult;
      requests?: BigNumber[];
    }) => {
      if (!chainId || !account || !signature || !requests || !contractWeb3)
        return;

      setRequestAmount(signature.value);
      setTokenName('wstETH');

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
      setTxStage(TX_STAGE.SIGN);
      openTxModal();

      try {
        const transaction = await runWithTransactionLogger(
          'Stake signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();

        await runWithTransactionLogger('Stake block confirmation', async () =>
          transaction.wait(),
        );
        await updateData();

        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        setTxModalFailedText(errorMessage);
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        setTokenName('');
        openTxModal();
      }
    },
    [
      account,
      chainId,
      contractWeb3,
      openTxModal,
      setRequestAmount,
      setTokenName,
      setTxHash,
      setTxModalFailedText,
      setTxStage,
      updateData,
    ],
  );
};
