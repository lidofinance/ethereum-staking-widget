import { Link } from '@lidofinance/lido-ui';

import { CHAINS } from 'consts/chains';
import { getEtherscanTxLink } from 'utils/get-etherscan-tx-link';
import { useLidoSDK } from 'providers/lido-sdk';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: string | null;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const TxLinkEtherscan = (props: TxLinkEtherscanProps) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { chainId } = useLidoSDK();

  if (!txHash) return null;

  return (
    <Link
      onClick={onClick}
      href={getEtherscanTxLink(chainId as CHAINS, txHash)}
    >
      {text}
    </Link>
  );
};
