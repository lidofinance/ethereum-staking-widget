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
import type { ClaimResult } from '../claim-all-utils';

const statuses: Record<
  ClaimResult['status'],
  { label: string; color: TextColors }
> = {
  'not-started': { label: 'Not started', color: 'secondary' },
  rejected: { label: 'Rejected in wallet', color: 'secondary' }, // reject is a deliberate choice, not a fault to flag in red
  submitted: { label: 'Awaiting multisig approval', color: 'secondary' },
  claimed: { label: 'Claimed', color: 'success' },
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

const getStages = (transitStage: TransactionModalTransitStage) => ({
  ...getGeneralTransactionModalStages(transitStage),
  sign: (results: ClaimResult[], step?: string) =>
    transitStage(
      <TxStageSign
        title={`Claim ${results.length === 1 ? results[0].token + ' ' : ''}withdrawals`}
        description={
          <ClaimDescription>
            <ClaimAmounts amounts={results} />
            {step && <ClaimDetail>{step}</ClaimDetail>}
          </ClaimDescription>
        }
      />,
    ),
  pending: (
    results: ClaimResult[],
    txHash?: Hash,
    isAA?: boolean,
    step?: string,
  ) =>
    transitStage(
      <TxStagePending
        title={`Claiming ${results.length === 1 ? results[0].token + ' ' : ''}withdrawals`}
        description={
          <ClaimDescription>
            <ClaimAmounts amounts={results} />
            {step && <ClaimDetail>{step}</ClaimDetail>}
          </ClaimDescription>
        }
        txHash={txHash}
        isAA={isAA}
      />,
    ),
  result: (
    results: ClaimResult[],
    options: { callId?: string; error?: string } = {},
  ) => {
    const allClaimed = results.every(({ status }) => status === 'claimed');
    const someClaimed = results.some(({ status }) => status === 'claimed');
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
            {results.map((result) => (
              <ClaimResultItem key={result.token}>
                <ClaimAmounts amounts={[result]} />
                <ClaimStatus>
                  <ClaimStatusLabel color={statuses[result.status].color}>
                    {statuses[result.status].label}
                  </ClaimStatusLabel>
                  {result.txHash && (
                    <span>
                      <span aria-hidden="true">· </span>
                      <TxLinkEtherscan
                        txHash={result.txHash}
                        text="View on Etherscan"
                      />
                    </span>
                  )}
                </ClaimStatus>
              </ClaimResultItem>
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
