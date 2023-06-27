import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';
import { getEtherscanTxLink } from '@lido-sdk/helpers';

type EtherscanTxLink = {
  text?: string;
  txHash?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const EtherscanTxLink: FC<EtherscanTxLink> = (props) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { chainId } = useSDK();

  if (!txHash) return null;

  return (
    <Link onClick={onClick} href={getEtherscanTxLink(chainId, txHash)}>
      {text}
    </Link>
  );
};
