import { TextLink } from '@lidofinance/lido-app-ui';
import { useShowCallsStatus } from 'wagmi';

import { wagmiChainMap } from 'modules/web3';
import { getEtherscanTxLink } from 'utils/etherscan';

type WalletCallsLinkProps = { callId: string };

// an AA call batch has no tx hash yet: the wallet shows its status
const WalletCallsLink = ({ callId }: WalletCallsLinkProps) => {
  const { mutate: showCallsStatus, isPending } = useShowCallsStatus();
  return (
    <TextLink
      disabled={isPending}
      onClick={() => showCallsStatus({ id: callId })}
    >
      Show transaction in wallet
    </TextLink>
  );
};

export type TransactionLinkProps = {
  /** tx hash, or the EIP-5792 call id when `isAA` */
  txId: string;
  chainId: number;
  isAA: boolean;
};

/** the sent tx: an explorer link, or for AA the wallet's view of its call batch */
export const TransactionLink = ({
  txId,
  chainId,
  isAA,
}: TransactionLinkProps) => {
  if (isAA) return <WalletCallsLink callId={txId} />;

  const explorer = wagmiChainMap[chainId]?.blockExplorers?.default.name;
  return (
    <TextLink href={getEtherscanTxLink(chainId, txId)}>
      View on {explorer ?? 'explorer'}
    </TextLink>
  );
};
