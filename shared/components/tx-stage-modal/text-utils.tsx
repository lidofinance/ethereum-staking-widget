import { TX_OPERATION } from './types';
import { TxLinkEtherscan } from '../tx-link-etherscan';

// Inserts new lines in front of long numbers so that the currency symbol remains on the same line
export const withOptionaLineBreak = (text: string) => {
  return text.length < 8 ? (
    text
  ) : (
    <>
      <br />
      {text}
    </>
  );
};

export const getOperationProcessingDisplayText = (operation: TX_OPERATION) => {
  switch (operation) {
    case TX_OPERATION.STAKING:
      return 'Staking';
    case TX_OPERATION.APPROVING:
      return 'Approving';
    case TX_OPERATION.WRAPPING:
      return 'Wrapping';
    case TX_OPERATION.UNWRAPPING:
      return 'Unwrapping';
    default:
      return 'Processing';
  }
};

export const getOperationSuccessDisplayText = (operation: TX_OPERATION) => {
  switch (operation) {
    case TX_OPERATION.STAKING:
      return 'Staking';
    case TX_OPERATION.APPROVING:
      return 'Unlock';
    case TX_OPERATION.WRAPPING:
      return 'Wrapping';
    case TX_OPERATION.UNWRAPPING:
      return 'Unwrapping';
    default:
      return 'Operation';
  }
};

export const getSuccessText = (
  txHash: string | undefined | null,
  operation: TX_OPERATION,
) => {
  const operationDisplayText = getOperationSuccessDisplayText(operation);
  switch (operation) {
    case TX_OPERATION.STAKING:
    case TX_OPERATION.WRAPPING:
    case TX_OPERATION.UNWRAPPING:
      return (
        <>
          {operationDisplayText} operation was successful.{' '}
          {txHash && (
            <>
              Transaction can be viewed on{' '}
              <TxLinkEtherscan txHash={txHash} text=" Etherscan" />
            </>
          )}
        </>
      );
    default:
      return <>{operationDisplayText} was successful!</>;
  }
};
