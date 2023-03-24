import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { getEtherscanTxLink } from '@lido-sdk/helpers';

type EtherscanTxLink = {
  text?: string;
  txHash?: string;
};

export const EtherscanTxLink: FC<EtherscanTxLink> = (props) => {
  const { txHash, text = 'View on Etherscan' } = props;
  const { chainId } = useSDK();

  if (!txHash) return null;

  return (
    <Link
      href={
        // TODO
        chainId === CHAINS.Zhejiang
          ? `https://blockscout.com/eth/zhejiang-testnet/tx/${txHash}`
          : getEtherscanTxLink(chainId, txHash)
      }
    >
      {text}
    </Link>
  );
};
