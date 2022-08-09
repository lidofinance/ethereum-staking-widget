import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { isAddress } from 'ethers/lib/utils';
import { StethAbi } from '@lido-sdk/contracts';
import { CHAINS } from '@lido-sdk/constants';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import {
  enableQaHelpers,
  ErrorMessage,
  getErrorMessage,
  runWithTransactionLogger,
} from 'utils';
import { getBackendRPCPath } from 'config';
import { TX_STAGE } from 'shared/components';

type StakeProcessingProps = (
  stethContractWeb3: StethAbi | null,
  openTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  stethBalanceUpdate: () => void,
  inputValue: string,
  resetForm: () => void,
  chainId: number | undefined,
  refFromQuery: string | undefined,
) => Promise<void>;

export const getAddress = async (
  input: string | undefined,
  chainId: CHAINS | undefined,
): Promise<string> => {
  if (!input || !chainId) return '';
  if (isAddress(input)) return input;

  try {
    const provider = getStaticRpcBatchProvider(
      chainId,
      getBackendRPCPath(chainId),
    );
    const address = await provider.resolveName(input);

    if (address) return address;
  } catch (error) {
    throw new Error('Failed to resolve referral address');
  }

  throw new Error('Invalid referral address');
};

class MockLimitReachedError extends Error {
  reason: string;
  constructor(message: string) {
    super(message);
    this.reason = 'execution reverted: STAKE_LIMIT';
  }
}

export const stakeProcessing: StakeProcessingProps = async (
  stethContractWeb3,
  openTxModal,
  setTxStage,
  setTxHash,
  setTxModalFailedText,
  stethBalanceUpdate,
  inputValue,
  resetForm,
  chainId,
  refFromQuery,
) => {
  if (!stethContractWeb3 || !chainId) {
    return;
  }

  try {
    const referralAddress = await getAddress(refFromQuery, chainId);

    const provider = getStaticRpcBatchProvider(
      chainId,
      getBackendRPCPath(chainId),
    );

    const feeData = await provider.getFeeData();
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
    const maxFeePerGas = feeData.maxFeePerGas ?? undefined;

    const overrides = {
      value: parseEther(inputValue),
      maxPriorityFeePerGas,
      maxFeePerGas,
    };

    const callback = () =>
      stethContractWeb3.submit(referralAddress || AddressZero, overrides);

    setTxStage(TX_STAGE.SIGN);
    openTxModal();

    if (
      enableQaHelpers &&
      window.localStorage.getItem('mockLimitReached') === 'true'
    ) {
      throw new MockLimitReachedError('Stake limit reached');
    }

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

    await stethBalanceUpdate();

    setTxStage(TX_STAGE.SUCCESS);
    openTxModal();

    await resetForm();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    setTxModalFailedText(errorMessage);
    // Both LIMIT and FAIL are fail stages but limit reached has different UI
    setTxStage(
      errorMessage == ErrorMessage.LIMIT_REACHED
        ? TX_STAGE.LIMIT
        : TX_STAGE.FAIL,
    );
    setTxHash(undefined);
    openTxModal();
  }
};
