import type { Hash } from 'viem';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { isSupportedL1Chain } from 'consts/chains';

type SuccessTextProps = {
  operationText: string;
  txHash?: Hash;
  chainId?: number;
};

export const SuccessText = ({
  operationText,
  txHash,
  chainId,
}: SuccessTextProps) => {
  const isL1 = isSupportedL1Chain(chainId);
  const etherscanName = isL1 ? 'Etherscan' : 'Block Explorer';
  return (
    <>
      {operationText} operation was successful.
      {txHash && (
        <>
          <br />
          Transaction can be viewed on{' '}
          <TxLinkEtherscan txHash={txHash} text={etherscanName} />.
        </>
      )}
    </>
  );
};
