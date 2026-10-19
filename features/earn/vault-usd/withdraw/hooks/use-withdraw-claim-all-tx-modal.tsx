import type { Hash } from 'viem';
import { useShowCallsStatus } from 'wagmi';
import { Link, type TextColors } from '@lidofinance/lido-ui';
import { getGeneralTransactionModalStages } from 'shared/transaction-modal/hooks/get-general-transaction-modal-stages';
import {
  type TransactionModalTransitStage,
  useTransactionModalStage,
} from 'shared/transaction-modal/hooks/use-transaction-modal-stage';
import {
  TxStagePending,
  TxStageSign,
} from 'shared/transaction-modal/tx-stages-basic';
import {
  StageIconSuccess,
  StageIconFail,
  StageIconLimit,
} from 'shared/transaction-modal/tx-stages-basic/icons';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { ClaimAmounts } from '../../components/withdraw-claim-amounts';
import {
  ClaimDescription,
  ClaimResultItem,
  ClaimDetail,
  ClaimStatus,
  ClaimStatusLabel,
} from '../../components/withdraw-claim-amounts/styles';
import type { TokenClaim } from '../claim-all-utils';

const statuses: Record<
  TokenClaim['status'],
  { label: string; color: TextColors } | null
> = {
  'not-started': { label: 'Not started', color: 'secondary' },
  rejected: { label: 'Rejected in wallet', color: 'secondary' }, // reject is a deliberate choice, not a fault to flag in red
  submitted: { label: 'Awaiting multisig approval', color: 'secondary' },
  claimed: null, // the modal title and the Etherscan link already show success
  failed: { label: 'Failed', color: 'error' },
};

const BatchLink = ({ callId }: { callId: string }) => {
  const { mutate: showCallsStatus, isPending } = useShowCallsStatus();
  return (
    <Link
      aria-disabled={isPending}
      onClick={() => {
        if (!isPending) showCallsStatus({ id: callId });
      }}
    >
      Show transactions in wallet
    </Link>
  );
};

const ClaimResult = ({ claim }: { claim: TokenClaim }) => {
  const status = statuses[claim.status];
  const link = claim.txHash && (
    <TxLinkEtherscan txHash={claim.txHash} text="View on Etherscan" />
  );

  return (
    <ClaimResultItem>
      <ClaimAmounts amounts={[claim]} />
      {(status || link) && (
        <ClaimStatus>
          {status && (
            <ClaimStatusLabel color={status.color}>
              {status.label}
            </ClaimStatusLabel>
          )}
          {link && (
            <span>
              {status && <span aria-hidden="true">· </span>}
              {link}
            </span>
          )}
        </ClaimStatus>
      )}
    </ClaimResultItem>
  );
};

const getStages = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),
  sign: (claims: TokenClaim[], step?: string) =>
    transitStage(
      <TxStageSign
        title={`Claim ${claims.length === 1 ? claims[0].token + ' ' : ''}withdrawals`}
        description={
          <ClaimDescription>
            <ClaimAmounts amounts={claims} />
            {step && <ClaimDetail>{step}</ClaimDetail>}
          </ClaimDescription>
        }
      />,
    ),
  pending: (
    claims: TokenClaim[],
    txHash?: Hash,
    isAA?: boolean,
    step?: string,
  ) =>
    transitStage(
      <TxStagePending
        title={`Claiming ${claims.length === 1 ? claims[0].token + ' ' : ''}withdrawals`}
        description={
          <ClaimDescription>
            <ClaimAmounts amounts={claims} />
            {step && <ClaimDetail>{step}</ClaimDetail>}
          </ClaimDescription>
        }
        txHash={txHash}
        isAA={isAA}
      />,
    ),
  result: (
    claims: TokenClaim[],
    options: { callId?: string; error?: string } = {},
  ) => {
    const allClaimed = claims.every(({ status }) => status === 'claimed');
    const someClaimed = claims.some(({ status }) => status === 'claimed');
    transitStage(
      <TransactionModalContent
        icon={
          allClaimed ? (
            <StageIconSuccess />
          ) : someClaimed ? (
            <StageIconLimit />
          ) : (
            <StageIconFail />
          )
        }
        title={
          allClaimed
            ? 'Withdrawals have been claimed.'
            : someClaimed
              ? 'Some withdrawals have been claimed.'
              : 'Withdrawals have not been claimed.'
        }
        description={
          <ClaimDescription>
            {claims.map((claim) => (
              <ClaimResult key={claim.token} claim={claim} />
            ))}
            {options.error && <ClaimDetail>{options.error}</ClaimDetail>}
          </ClaimDescription>
        }
        footerHint={
          options.callId && !allClaimed ? (
            <BatchLink callId={options.callId} />
          ) : undefined
        }
      />,
      { isClosableOnLedger: true },
    );
  },
});

export const useUsdVaultWithdrawClaimAllTxModal = () =>
  useTransactionModalStage(getStages);
