import type { Hash } from 'viem';
import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useDappStatus } from 'modules/web3';
import { getEtherscanTxLink } from 'utils/etherscan';

type TxLinkEtherscanProps = {
  text?: string;
  txHash?: Hash;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const TxLinkEtherscan = (props: TxLinkEtherscanProps) => {
  const { txHash, text = 'View on Etherscan', onClick } = props;
  const { walletChainId } = useDappStatus();

  if (!txHash) return null;

  // This component is used in TransactionModal, which is wrapped by SupportL1Chains,
  // but not wrapped by SupportL2Chains (the chainId will never be a L2 network).
  // This is currently the fastest solution.
  return (
    <Link
      onClick={onClick}
      href={getEtherscanTxLink(walletChainId ?? config.defaultChain, txHash)}
    >
      {text}
    </Link>
  );
};
