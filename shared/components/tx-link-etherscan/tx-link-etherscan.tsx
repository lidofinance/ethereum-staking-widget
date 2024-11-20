import type { Address } from 'viem';
import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useDappStatus } from 'modules/web3';
import { getEtherscanTxLink } from 'utils/etherscan';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: Address;
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
