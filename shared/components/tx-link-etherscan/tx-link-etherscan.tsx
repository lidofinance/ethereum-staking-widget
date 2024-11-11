import { Link } from '@lidofinance/lido-ui';

import { CHAINS } from 'consts/chains';
import { getEtherscanTxLink } from 'utils/get-etherscan-tx-link';
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

  // This component is used in TransactionModal, which is wrapped by SupportL1Chains,
  // but not wrapped by SupportL2Chains (the chainId will never be a L2 network).
  // This is currently the fastest solution.
  return (
    <Link
      onClick={onClick}
      href={getEtherscanTxLink(walletChainId as CHAINS, txHash)}
    >
      {text}
    </Link>
  );
};
