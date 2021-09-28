import { parseEther } from '@ethersproject/units';
import { WstethAbi } from '@lido-sdk/contracts';
import { getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { TX_STAGE } from 'components/txStageModal';
import { runWithTransactionLogger } from 'utils';

const ETH = 'ETH';

type UnwrapProcessingProps = (
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  wstethBalanceUpdate: () => void,
  inputValue: string,
) => Promise<void>;

export const unwrapProcessing: UnwrapProcessingProps = async (
  wstethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  wstethBalanceUpdate,
  inputValue,
) => {
  if (!wstethContractWeb3) {
    return;
  }

  try {
    const callback = () => wstethContractWeb3.unwrap(parseEther(inputValue));

    openTxModal();
    setTxStage(TX_STAGE.SIGN);

    const transaction = await runWithTransactionLogger(
      'Unwrap signing',
      callback,
    );

    setTxHash(transaction.hash);
    setTxStage(TX_STAGE.BLOCK);

    await runWithTransactionLogger('Unwrap block confirmation', async () =>
      transaction.wait(),
    );

    await wstethBalanceUpdate();

    setTxStage(TX_STAGE.SUCCESS);
  } catch (e) {
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    console.error(e);
  }
};

type WrapProcessingWithApproveProps = (
  chainId: number | undefined,
  stethContractWeb3: WstethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  inputValue: string,
  selectedToken: string,
  needsApprove: boolean,
  approve: () => void,
) => Promise<void>;

export const wrapProcessingWithApprove: WrapProcessingWithApproveProps = async (
  chainId,
  wstethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  inputValue,
  selectedToken,
  needsApprove,
  approve,
) => {
  if (!chainId || !wstethContractWeb3) {
    return;
  }

  const wstethTokenAddress = getTokenAddress(chainId, TOKENS.WSTETH);

  try {
    if (selectedToken === ETH) {
      const callback = () =>
        wstethContractWeb3.signer.sendTransaction({
          to: wstethTokenAddress,
          value: parseEther(inputValue),
        });

      openTxModal();
      setTxStage(TX_STAGE.SIGN);

      const transaction = await runWithTransactionLogger(
        'Wrap signing',
        callback,
      );

      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);

      await runWithTransactionLogger('Wrap block confirmation', async () =>
        transaction.wait(),
      );

      setTxStage(TX_STAGE.SUCCESS);
    } else if (selectedToken === TOKENS.STETH) {
      if (needsApprove) {
        await approve();
      } else {
        const callback = () => wstethContractWeb3.wrap(parseEther(inputValue));

        openTxModal();
        setTxStage(TX_STAGE.SIGN);

        const transaction = await runWithTransactionLogger(
          'Wrap signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);

        await runWithTransactionLogger('Wrap block confirmation', async () =>
          transaction.wait(),
        );

        setTxStage(TX_STAGE.SUCCESS);
      }
    }
  } catch (e) {
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    console.error(e);
  }
};
