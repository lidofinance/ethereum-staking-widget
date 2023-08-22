import { parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { WstethAbi } from '@lido-sdk/contracts';
import { CHAINS } from '@lido-sdk/constants';
import { TX_STAGE } from 'shared/components';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { getFeeData } from 'utils/getFeeData';
import invariant from 'tiny-invariant';
import type { Web3Provider } from '@ethersproject/providers';

type UnwrapProcessingProps = (
  providerWeb3: Web3Provider | undefined,
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  wstethBalanceUpdate: () => Promise<BigNumber | undefined>,
  stethBalanceUpdate: () => Promise<BigNumber | undefined>,
  chainId: string | number | undefined,
  inputValue: string,
  resetForm: () => void,
  isMultisig: boolean,
) => Promise<void>;

export const unwrapProcessing: UnwrapProcessingProps = async (
  providerWeb3,
  wstethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  setTxModalFailedText,
  wstethBalanceUpdate,
  stethBalanceUpdate,
  chainId,
  inputValue,
  resetForm,
  isMultisig,
) => {
  invariant(wstethContractWeb3, 'must have wstethContractWeb3');
  invariant(chainId, 'must have chain id');
  invariant(providerWeb3, 'must have providerWeb3');

  try {
    const callback = async () => {
      if (isMultisig) {
        const tx = await wstethContractWeb3.populateTransaction.unwrap(
          parseEther(inputValue),
        );
        return providerWeb3.getSigner().sendUncheckedTransaction(tx);
      } else {
        const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(
          chainId as CHAINS,
        );
        return wstethContractWeb3.unwrap(parseEther(inputValue), {
          maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
          maxFeePerGas: maxFeePerGas ?? undefined,
        });
      }
    };

    setTxStage(TX_STAGE.SIGN);
    openTxModal();

    const transaction = await runWithTransactionLogger(
      'Unwrap signing',
      callback,
    );

    const handleEnding = () => {
      openTxModal();
      resetForm();
      void stethBalanceUpdate();
      void wstethBalanceUpdate();
    };

    if (isMultisig) {
      setTxStage(TX_STAGE.SUCCESS_MULTISIG);
      handleEnding();
      return;
    }

    if (typeof transaction === 'object') {
      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);
      openTxModal();
      await runWithTransactionLogger('Unwrap block confirmation', async () =>
        transaction.wait(),
      );
    }

    setTxStage(TX_STAGE.SUCCESS);
    handleEnding();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    // errors are sometimes nested :(
    setTxModalFailedText(getErrorMessage(error));
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    openTxModal();
  }
};
