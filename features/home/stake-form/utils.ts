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
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';
import type { Web3Provider } from '@ethersproject/providers';

const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

type StakeProcessingProps = (
  providerWeb3: Web3Provider | undefined,
  stethContractWeb3: StethAbi | null,
  openTxModal: () => void,
  closeTxModal: () => void,
  setTxStage: (value: TX_STAGE) => void,
  setTxHash: (value: string | undefined) => void,
  setTxModalFailedText: (value: string) => void,
  stethBalanceUpdate: () => void,
  inputValue: string,
  resetForm: () => void,
  chainId: number | undefined,
  refFromQuery: string | undefined,
  isMultisig: boolean,
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
  providerWeb3,
  stethContractWeb3,
  openTxModal,
  closeTxModal,
  setTxStage,
  setTxHash,
  setTxModalFailedText,
  stethBalanceUpdate,
  inputValue,
  resetForm,
  chainId,
  refFromQuery,
  isMultisig,
) => {
  if (!stethContractWeb3 || !chainId) {
    return;
  }

  invariant(providerWeb3, 'must have providerWeb3');

  try {
    const referralAddress = await getAddress(refFromQuery, chainId);

    const callback = async () => {
      if (isMultisig) {
        const tx = await stethContractWeb3.populateTransaction.submit(
          referralAddress || AddressZero,
          {
            value: parseEther(inputValue),
          },
        );
        return providerWeb3.getSigner().sendUncheckedTransaction(tx);
      } else {
        const provider = getStaticRpcBatchProvider(
          chainId,
          getBackendRPCPath(chainId),
        );

        const feeData = await provider.getFeeData();

        const overrides = {
          value: parseEther(inputValue),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
          maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        };

        const originalGasLimit = await stethContractWeb3.estimateGas.submit(
          referralAddress || AddressZero,
          overrides,
        );

        const gasLimit = originalGasLimit
          ? BigNumber.from(
              Math.ceil(
                originalGasLimit.toNumber() *
                  SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
              ),
            )
          : undefined;

        return stethContractWeb3.submit(referralAddress || AddressZero, {
          ...overrides,
          gasLimit,
        });
      }
    };

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

    const handleEnding = () => {
      resetForm();
      stethBalanceUpdate();
    };

    if (isMultisig) {
      closeTxModal();
      handleEnding();
      return;
    }

    if (typeof transaction === 'object') {
      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);
      openTxModal();
      await runWithTransactionLogger('Stake block confirmation', async () =>
        transaction.wait(),
      );
    }

    setTxStage(TX_STAGE.SUCCESS);
    openTxModal();
    handleEnding();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
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
