import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { StethAbi } from '@lido-sdk/contracts';
import { TX_STAGE } from 'shared/components';
import { runWithTransactionLogger } from 'utils';

type StakeProcessingProps = (
  stethContractWeb3: StethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  stethBalanceUpdate: () => void,
  inputValue: string,
  resetForm: () => void,
) => Promise<void>;

export const stakeProcessing: StakeProcessingProps = async (
  stethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  stethBalanceUpdate,
  inputValue,
  resetForm,
) => {
  if (!stethContractWeb3) {
    return;
  }

  try {
    const callback = () =>
      stethContractWeb3.submit(AddressZero, {
        value: parseEther(inputValue),
      });

    openTxModal();
    setTxStage(TX_STAGE.SIGN);
    const transaction = await runWithTransactionLogger(
      'Stake signing',
      callback,
    );

    setTxHash(transaction.hash);
    setTxStage(TX_STAGE.BLOCK);
    await runWithTransactionLogger('Stake block confirmation', async () =>
      transaction.wait(),
    );

    await stethBalanceUpdate();

    setTxStage(TX_STAGE.SUCCESS);

    await resetForm();
  } catch (e) {
    setTxStage(TX_STAGE.FAIL);
    setTxHash(undefined);
    console.error(e);
  }
};
