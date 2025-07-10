import type { Hash } from 'viem';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconLoader } from './icons';
import { useShowCallsStatus } from 'wagmi';
import { Link } from '@lidofinance/lido-ui';

type TxStagePendingProps = {
  description?: React.ReactNode;
  title: React.ReactNode;
  txHash?: Hash;
  isAA?: boolean;
};

type AAFooterLinkProps = { callId: string };

const AAFooterLink = ({ callId }: AAFooterLinkProps) => {
  const { showCallsStatus, isPending } = useShowCallsStatus();
  return (
    <Link
      onClick={(event) => {
        event.preventDefault();
        if (!isPending) showCallsStatus({ id: callId });
      }}
      aria-disabled={isPending}
    >
      Show transaction in wallet
    </Link>
  );
};

export const TxStagePending = ({
  title,
  description,
  txHash,
  isAA,
}: TxStagePendingProps) => {
  return (
    <TransactionModalContent
      icon={<StageIconLoader />}
      title={title}
      description={description || 'Awaiting block confirmation'}
      footerHint={
        txHash &&
        (isAA ? (
          <AAFooterLink callId={txHash} />
        ) : (
          <TxLinkEtherscan txHash={txHash} />
        ))
      }
    />
  );
};
