import { Link } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';
import { getEtherscanTxLink } from '@lido-sdk/helpers';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: string | null;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const TxLinkEtherscan = (props: TxLinkEtherscanProps) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { chainId } = useSDK();

  if (!txHash) return null;

  return (
    <Link onClick={onClick} href={getEtherscanTxLink(chainId, txHash)}>
      {text}
    </Link>
  );
};
