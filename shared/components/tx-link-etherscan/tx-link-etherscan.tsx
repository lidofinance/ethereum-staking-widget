import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { getEtherscanTxLink } from 'utils/etherscan';
import { useDappStatus } from 'modules/web3';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: string | null;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const TxLinkEtherscan = (props: TxLinkEtherscanProps) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { walletChainId } = useDappStatus();

  if (!txHash) return null;

  return (
    <Link
      onClick={onClick}
      href={getEtherscanTxLink(walletChainId ?? config.defaultChain, txHash)}
    >
      {text}
    </Link>
  );
};
