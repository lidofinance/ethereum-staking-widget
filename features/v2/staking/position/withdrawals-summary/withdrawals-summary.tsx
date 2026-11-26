import type { ReactNode } from 'react';
import { Divider, Typography } from '@lidofinance/lido-app-ui';

// TODO: data comes straight from the withdrawals feature until it is refactored
import {
  useWithdrawalRequests,
  type WithdrawalRequests,
} from 'features/withdrawals/hooks';
import { formatTimestamp } from 'features/withdrawals/utils/format-timestamp';
import { FormatToken } from 'shared/formatters';

import { useCollapseMotion } from '../../../utils';

import {
  ArrowButton,
  ArrowRight,
  ClaimLink,
  WithdrawalsClip,
  WithdrawalsCollapse,
  WithdrawalsRow,
} from './styles';

type Summary = {
  text: ReactNode;
  action?: string;
};

// formatTimestamp reads a past estimate as plain "Pending": nothing to add then
const formatEstimate = (finalizationAt: string | null) =>
  finalizationAt && Date.parse(finalizationAt) > Date.now()
    ? formatTimestamp(finalizationAt)
    : null;

// ready requests win over pending ones: claiming is what the user can do now
const getSummary = (requests: WithdrawalRequests): Summary | null => {
  const { readyCount, pendingCount } = requests;

  if (readyCount > 0) {
    const amount = (
      <FormatToken amount={requests.claimableAmountOfETH} symbol="ETH" />
    );

    if (pendingCount > 0) {
      const total = readyCount + pendingCount;
      return {
        text: (
          <>
            {readyCount} of {total} requests ready: {amount}.
          </>
        ),
        action: 'Claim',
      };
    }

    if (readyCount === 1) {
      return { text: <>{amount} withdrawal ready.</>, action: 'Claim' };
    }

    return { text: <>All requests ready: {amount}.</>, action: 'Claim all' };
  }

  if (pendingCount > 0) {
    const amount = (
      <FormatToken amount={requests.pendingAmountOfStETH} symbol="ETH" />
    );

    if (pendingCount > 1) {
      return {
        text: (
          <>
            {amount} across {pendingCount} pending requests.
          </>
        ),
      };
    }

    const estimate = formatEstimate(requests.maxFinalizationAt);
    return {
      text: (
        <>
          {amount} withdrawing.{estimate && <> Ready in {estimate}</>}
        </>
      ),
    };
  }

  return null;
};

export const WithdrawalsSummary = () => {
  const { data } = useWithdrawalRequests();

  const summary = data ? getSummary(data) : null;
  const collapseMotion = useCollapseMotion(!!summary);

  return (
    <WithdrawalsCollapse
      {...collapseMotion}
      // set only when hidden: the styles key on the attribute being present
      aria-hidden={summary ? undefined : true}
    >
      <WithdrawalsClip>
        <Divider />

        <WithdrawalsRow>
          <Typography as="span" variant="description" color="secondary">
            {summary?.text}{' '}
            {summary?.action && (
              <ClaimLink
                onClick={() => {
                  // claim action
                }}
                variant="primary"
              >
                <Typography as="span" weight="bold">
                  {summary?.action}
                </Typography>
              </ClaimLink>
            )}
          </Typography>
          <ArrowButton
            onClick={() => {
              // open withdrawals panel action
            }}
            type="button"
            aria-label="Withdrawal requests"
            tabIndex={summary ? 0 : -1}
          >
            <ArrowRight />
          </ArrowButton>
        </WithdrawalsRow>
      </WithdrawalsClip>
    </WithdrawalsCollapse>
  );
};
