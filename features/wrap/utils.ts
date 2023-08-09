import { parseEther } from '@ethersproject/units';
import { WstethAbi } from '@lido-sdk/contracts';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { TX_STAGE } from 'shared/components';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { getStaticRpcBatchProvider } from 'utils/rpcProviders';
import { getBackendRPCPath } from 'config';
import invariant from 'tiny-invariant';
import type { Web3Provider } from '@ethersproject/providers';

const ETH = 'ETH';

type UnwrapProcessingProps = (
  providerWeb3: Web3Provider | undefined,
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  closeTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  wstethBalanceUpdate: () => Promise<unknown>,
  stethBalanceUpdate: () => Promise<unknown>,
  chainId: string | number | undefined,
  inputValue: string,
  resetForm: () => void,
  isMultisig: boolean,
) => Promise<void>;

export const unwrapProcessing: UnwrapProcessingProps = async (
  providerWeb3,
  wstethContractWeb3,
  openTxModal,
  closeTxModal,
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
  if (!wstethContractWeb3 || !chainId) {
    return;
  }

  invariant(providerWeb3, 'must have providerWeb3');

  try {
    const callback = async () => {
      if (isMultisig) {
        const tx = await wstethContractWeb3.populateTransaction.unwrap(
          parseEther(inputValue),
        );
        return providerWeb3.getSigner().sendUncheckedTransaction(tx);
      } else {
        const provider = getStaticRpcBatchProvider(
          chainId,
          getBackendRPCPath(chainId),
        );
        const feeData = await provider.getFeeData();
        return wstethContractWeb3.unwrap(parseEther(inputValue), {
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
          maxFeePerGas: feeData.maxFeePerGas ?? undefined,
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
      resetForm();
      void stethBalanceUpdate();
      void wstethBalanceUpdate();
    };

    if (isMultisig) {
      handleEnding();
      closeTxModal();
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

    handleEnding();
    setTxStage(TX_STAGE.SUCCESS);
    openTxModal();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    // errors are sometimes nested :(
    setTxModalFailedText(getErrorMessage(error));
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    openTxModal();
  }
};

type WrapProcessingWithApproveProps = (
  chainId: number | undefined,
  providerWeb3: Web3Provider | undefined,
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  closeTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  ethBalanceUpdate: () => Promise<unknown>,
  stethBalanceUpdate: () => Promise<unknown>,
  inputValue: string,
  selectedToken: string,
  needsApprove: boolean,
  isMultisig: boolean,
  approve: () => Promise<void>,
  resetForm: () => void,
) => Promise<void>;

export const wrapProcessingWithApprove: WrapProcessingWithApproveProps = async (
  chainId,
  providerWeb3,
  wstethContractWeb3,
  openTxModal,
  closeTxModal,
  setTxStage,
  setTxHash,
  setTxModalFailedText,
  ethBalanceUpdate,
  stethBalanceUpdate,
  inputValue,
  selectedToken,
  needsApprove,
  isMultisig,
  approve,
  resetForm,
) => {
  if (!chainId || !wstethContractWeb3) {
    return;
  }

  invariant(providerWeb3, 'must have providerWeb3');

  const wstethTokenAddress = getTokenAddress(chainId, TOKENS.WSTETH);

  const handleEnding = () => {
    resetForm();
    void ethBalanceUpdate();
    void stethBalanceUpdate();
  };

  const getGasParameters = async () => {
    const provider = getStaticRpcBatchProvider(
      chainId,
      getBackendRPCPath(chainId),
    );
    const feeData = await provider.getFeeData();
    return {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };
  };

  try {
    if (selectedToken === ETH) {
      const callback = async () => {
        if (isMultisig) {
          return providerWeb3.getSigner().sendUncheckedTransaction({
            to: wstethTokenAddress,
            value: parseEther(inputValue),
          });
        } else {
          return wstethContractWeb3.signer.sendTransaction({
            to: wstethTokenAddress,
            value: parseEther(inputValue),
            ...(await getGasParameters()),
          });
        }
      };

      setTxStage(TX_STAGE.SIGN);
      openTxModal();

      const transaction = await runWithTransactionLogger(
        'Wrap signing',
        callback,
      );

      if (isMultisig) {
        closeTxModal();
        handleEnding();
        return;
      }

      if (typeof transaction === 'object') {
        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();
        await runWithTransactionLogger('Wrap block confirmation', async () =>
          transaction.wait(),
        );
      }

      handleEnding();
      setTxStage(TX_STAGE.SUCCESS);
      openTxModal();
    } else if (selectedToken === TOKENS.STETH) {
      if (needsApprove) {
        return approve();
      } else {
        const callback = async () => {
          if (isMultisig) {
            const tx = await wstethContractWeb3.populateTransaction.wrap(
              parseEther(inputValue),
            );
            return providerWeb3.getSigner().sendUncheckedTransaction(tx);
          } else {
            return wstethContractWeb3.wrap(
              parseEther(inputValue),
              await getGasParameters(),
            );
          }
        };

        setTxStage(TX_STAGE.SIGN);
        openTxModal();

        const transaction = await runWithTransactionLogger(
          'Wrap signing',
          callback,
        );

        if (isMultisig) {
          closeTxModal();
          handleEnding();
          return;
        }

        if (typeof transaction === 'object') {
          setTxHash(transaction.hash);
          setTxStage(TX_STAGE.BLOCK);
          openTxModal();
          await runWithTransactionLogger('Wrap block confirmation', async () =>
            transaction.wait(),
          );
        }

        handleEnding();
        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();
      }
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    // errors are sometimes nested :(
    setTxModalFailedText(getErrorMessage(error));
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    openTxModal();
  }
};
