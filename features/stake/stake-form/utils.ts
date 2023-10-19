import { isAddress } from 'ethers/lib/utils';
import type { BaseProvider } from '@ethersproject/providers';

export const SUBMIT_EXTRA_GAS_TRANSACTION_RATIO = 1.05;

export const getAddress = async (
  input: string | null,
  providerRpc: BaseProvider,
): Promise<string | undefined> => {
  if (!input) return undefined;
  if (isAddress(input)) return input;

  try {
    const address = await providerRpc.resolveName(input);
    if (address) return address;
  } catch {
    // noop
  }
  return undefined;
};

export class MockLimitReachedError extends Error {
  reason: string;
  constructor(message: string) {
    super(message);
    this.reason = 'execution reverted: STAKE_LIMIT';
  }
}

// export const stakeProcessing: StakeProcessingProps = async (
//   providerWeb3,
//   stethContractWeb3,
//   openTxModal,
//   setTxStage,
//   setTxHash,
//   setTxModalFailedText,
//   stethBalanceUpdate,
//   inputValue,
//   resetForm,
//   chainId,
//   refFromQuery,
//   isMultisig,
// ) => {
//   try {
//     invariant(stethContractWeb3);
//     invariant(chainId);
//     invariant(providerWeb3);

//     const referralAddress = await getAddress(refFromQuery, chainId);
//     const callback = async () => {
//       if (isMultisig) {
//         const tx = await stethContractWeb3.populateTransaction.submit(
//           referralAddress || AddressZero,
//           {
//             value: parseEther(inputValue),
//           },
//         );
//         return providerWeb3.getSigner().sendUncheckedTransaction(tx);
//       } else {
//         const feeData = await getFeeData(chainId);
//         const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined;
//         const maxFeePerGas = feeData.maxFeePerGas ?? undefined;
//         const overrides = {
//           value: parseEther(inputValue),
//           maxPriorityFeePerGas,
//           maxFeePerGas,
//         };

//         const originalGasLimit = await stethContractWeb3.estimateGas.submit(
//           referralAddress || AddressZero,
//           overrides,
//         );

//         const gasLimit = originalGasLimit
//           ? BigNumber.from(
//               Math.ceil(
//                 originalGasLimit.toNumber() *
//                   SUBMIT_EXTRA_GAS_TRANSACTION_RATIO,
//               ),
//             )
//           : undefined;

//         return stethContractWeb3.submit(referralAddress || AddressZero, {
//           ...overrides,
//           gasLimit,
//         });
//       }
//     };

//     setTxStage(TX_STAGE.SIGN);
//     openTxModal();

//     if (
//       enableQaHelpers &&
//       window.localStorage.getItem('mockLimitReached') === 'true'
//     ) {
//       throw new MockLimitReachedError('Stake limit reached');
//     }

//     const transaction = await runWithTransactionLogger(
//       'Stake signing',
//       callback,
//     );

//     const handleEnding = () => {
//       openTxModal();
//       resetForm();
//       stethBalanceUpdate();
//     };

//     if (isMultisig) {
//       setTxStage(TX_STAGE.SUCCESS_MULTISIG);
//       handleEnding();
//       return;
//     }

//     if (typeof transaction === 'object') {
//       setTxHash(transaction.hash);
//       setTxStage(TX_STAGE.BLOCK);
//       openTxModal();
//       await runWithTransactionLogger('Stake block confirmation', async () =>
//         transaction.wait(),
//       );
//     }

//     setTxStage(TX_STAGE.SUCCESS);
//     handleEnding();
//     /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
//   } catch (error: any) {
//     const errorMessage = getErrorMessage(error);
//     setTxModalFailedText(errorMessage);
//     // Both LIMIT and FAIL are fail stages but limit reached has different UI
//     setTxStage(
//       errorMessage == ErrorMessage.LIMIT_REACHED
//         ? TX_STAGE.LIMIT
//         : TX_STAGE.FAIL,
//     );
//     setTxHash(undefined);
//     openTxModal();
//   }
// };
