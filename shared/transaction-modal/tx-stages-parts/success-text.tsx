import type { Address } from 'viem';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';

type SuccessTextProps = {
  operationText: string;
  txHash?: Address;
};

export const SuccessText = ({ operationText, txHash }: SuccessTextProps) => {
  return (
    <>
      {operationText} operation was successful.
      {txHash && (
        <>
          <br />
          Transaction can be viewed on{' '}
          <TxLinkEtherscan txHash={txHash} text="Etherscan" />.
        </>
      )}
    </>
  );
};
