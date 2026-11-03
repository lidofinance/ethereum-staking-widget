import { isHash, type Hash } from 'viem';
import { mainnet } from 'viem/chains';

import type { L2SlowStakeStatus } from 'modules/l2-staking';
import { getEtherscanTxLink } from 'utils/etherscan';

export type SlowStakeExplorerLink = { text: string; url: string };

const txLink = (chainId: number, hash: Hash): SlowStakeExplorerLink => ({
  text: chainId === mainnet.id ? `View on Etherscan` : `View on Block Explorer`,
  url: getEtherscanTxLink(chainId, hash),
});

const ccipLink = (status: L2SlowStakeStatus): SlowStakeExplorerLink => ({
  text: 'View on CCIP Explorer',
  url: status.ccipExplorerUrl,
});

// Where to look at the latest step a stake has completed: the L2 send, the
// CCIP message while in transport, the Ethereum transaction once executed
// there, and the L2 landing once there is one
export const getSlowStakeExplorerLink = (
  status: L2SlowStakeStatus,
  l2ChainId: number,
): SlowStakeExplorerLink => {
  switch (status.stage) {
    // a placeholder may not carry its send hash yet
    case 'sent':
      return isHash(status.sendTxHash)
        ? txLink(l2ChainId, status.sendTxHash)
        : ccipLink(status);
    case 'in_transit':
    case 'transport_failed':
      return ccipLink(status);
    case 'parked':
    case 'recovered':
    case 'unresolved':
    case 'bridging':
      return txLink(mainnet.id, status.l1TxHash);
    case 'relay_failed':
    case 'delivered':
      return status.l2TxHash
        ? txLink(l2ChainId, status.l2TxHash)
        : txLink(mainnet.id, status.l1TxHash);
  }
};
