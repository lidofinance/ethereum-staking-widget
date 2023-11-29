import { BigNumber } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import invariant from 'tiny-invariant';

import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import type { Web3Provider } from '@ethersproject/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';
import { StethAbi } from '@lido-sdk/contracts';

import { TX_STAGE } from 'shared/components';
import {
  enableQaHelpers,
  ErrorMessage,
  getErrorMessage,
  runWithTransactionLogger,
} from 'utils';
import { getFeeData } from 'utils/getFeeData';

const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

type StakeProcessingProps = (
  staticRpcProvider: StaticJsonRpcBatchProvider,
  providerWeb3: Web3Provider | undefined,
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
  isMultisig: boolean,
) => Promise<void>;

export const getAddress = async (
  input: string | undefined,
  provider: StaticJsonRpcBatchProvider,
): Promise<string> => {
  if (!input) return '';
  if (isAddress(input)) return input;

  try {
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
  staticRpcProvider,
  providerWeb3,
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
  isMultisig,
) => {
  try {
    invariant(stethContractWeb3);
    invariant(chainId);
    invariant(providerWeb3);

    const referralAddress = await getAddress(refFromQuery, staticRpcProvider);
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
        const feeData = await getFeeData(staticRpcProvider);
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
        const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
        const overrides = {
          value: parseEther(inputValue),
          maxPriorityFeePerGas,
          maxFeePerGas,
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
      openTxModal();
      resetForm();
      stethBalanceUpdate();
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
      await runWithTransactionLogger('Stake block confirmation', async () =>
        transaction.wait(),
      );
    }

    setTxStage(TX_STAGE.SUCCESS);
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
