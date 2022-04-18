import { parseEther } from '@ethersproject/units';
import { WstethAbi } from '@lido-sdk/contracts';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { TX_STAGE } from 'shared/components';
import { getErrorMessage, runWithTransactionLogger } from 'utils';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { getBackendRPCPath } from 'config';

const ETH = 'ETH';

type UnwrapProcessingProps = (
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  wstethBalanceUpdate: () => void,
  stethBalanceUpdate: () => void,
  chainId: CHAINS | undefined,
  inputValue: string,
  resetForm: () => void,
) => Promise<void>;

export const unwrapProcessing: UnwrapProcessingProps = async (
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
) => {
  if (!wstethContractWeb3 || !chainId) {
    return;
  }

  const provider = getStaticRpcBatchProvider(
    chainId,
    getBackendRPCPath(chainId),
  );

  try {
    const feeData = await provider.getFeeData();
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
    const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

    const callback = () =>
      wstethContractWeb3.unwrap(parseEther(inputValue), {
        maxPriorityFeePerGas,
        maxFeePerGas,
      });

    setTxStage(TX_STAGE.SIGN);
    openTxModal();

    const transaction = await runWithTransactionLogger(
      'Unwrap signing',
      callback,
    );

    setTxHash(transaction.hash);
    setTxStage(TX_STAGE.BLOCK);
    openTxModal();

    await runWithTransactionLogger('Unwrap block confirmation', async () =>
      transaction.wait(),
    );

    await resetForm();
    await stethBalanceUpdate();
    await wstethBalanceUpdate();

    setTxStage(TX_STAGE.SUCCESS);
    openTxModal();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    // errors are sometimes nested :(
    setTxModalFailedText(getErrorMessage(error?.error?.code ?? error?.code));
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    openTxModal();
  }
};

type WrapProcessingWithApproveProps = (
  chainId: number | undefined,
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  ethBalanceUpdate: () => void,
  stethBalanceUpdate: () => void,
  inputValue: string,
  selectedToken: string,
  needsApprove: boolean,
  approve: () => void,
  resetForm: () => void,
) => Promise<void>;

export const wrapProcessingWithApprove: WrapProcessingWithApproveProps = async (
  chainId,
  wstethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  setTxModalFailedText,
  ethBalanceUpdate,
  stethBalanceUpdate,
  inputValue,
  selectedToken,
  needsApprove,
  approve,
  resetForm,
) => {
  if (!chainId || !wstethContractWeb3) {
    return;
  }

  const wstethTokenAddress = getTokenAddress(chainId, TOKENS.WSTETH);

  const provider = getStaticRpcBatchProvider(
    chainId,
    getBackendRPCPath(chainId),
  );
  const feeData = await provider.getFeeData();
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
  const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

  try {
    if (selectedToken === ETH) {
      const callback = () =>
        wstethContractWeb3.signer.sendTransaction({
          to: wstethTokenAddress,
          value: parseEther(inputValue),
          maxPriorityFeePerGas,
          maxFeePerGas,
        });

      setTxStage(TX_STAGE.SIGN);
      openTxModal();

      const transaction = await runWithTransactionLogger(
        'Wrap signing',
        callback,
      );

      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);
      openTxModal();

      await runWithTransactionLogger('Wrap block confirmation', async () =>
        transaction.wait(),
      );

      await resetForm();
      await ethBalanceUpdate();
      await stethBalanceUpdate();

      setTxStage(TX_STAGE.SUCCESS);
      openTxModal();
    } else if (selectedToken === TOKENS.STETH) {
      if (needsApprove) {
        await approve();
      } else {
        const callback = () =>
          wstethContractWeb3.wrap(parseEther(inputValue), {
            maxPriorityFeePerGas,
            maxFeePerGas,
          });

        setTxStage(TX_STAGE.SIGN);
        openTxModal();

        const transaction = await runWithTransactionLogger(
          'Wrap signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();

        await runWithTransactionLogger('Wrap block confirmation', async () =>
          transaction.wait(),
        );

        await resetForm();
        await ethBalanceUpdate();
        await stethBalanceUpdate();

        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();
      }
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    // errors are sometimes nested :(
    setTxModalFailedText(getErrorMessage(error?.error?.code ?? error?.code));
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    openTxModal();
  }
};
