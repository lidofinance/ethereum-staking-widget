import { Divider } from '@lidofinance/lido-app-ui';

// TODO: data comes straight from the withdrawals feature until it is refactored
import { useWithdrawalRequests } from 'features/withdrawals/hooks';
import { formatTimestamp } from 'features/withdrawals/utils/format-timestamp';
import { FormatToken } from 'shared/formatters';

import { useCollapseMotion } from '../../utils';

import {
  ArrowRight,
  WithdrawalsButton,
  WithdrawalsClip,
  WithdrawalsCollapse,
  WithdrawalsText,
} from './styles';

// formatTimestamp reads a past estimate as plain "Pending": nothing to add then
const formatEstimate = (finalizationAt: string | null) =>
  finalizationAt && Date.parse(finalizationAt) > Date.now()
    ? formatTimestamp(finalizationAt)
    : null;

export const PendingWithdrawals = () => {
  const { data } = useWithdrawalRequests();

  const hasPending = !!data && data.pendingCount > 0;
  const collapseMotion = useCollapseMotion(hasPending);
  const estimate = formatEstimate(data?.maxFinalizationAt ?? null);

  return (
    <WithdrawalsCollapse {...collapseMotion} aria-hidden={!hasPending}>
      <WithdrawalsClip>
        <Divider />
        {/* TODO: action */}
        <WithdrawalsButton type="button" tabIndex={hasPending ? 0 : -1}>
          <WithdrawalsText>
            <FormatToken amount={data?.pendingAmountOfStETH} symbol="ETH" />{' '}
            pending
            {estimate && <> · Est. {estimate}</>}
          </WithdrawalsText>
          <ArrowRight />
        </WithdrawalsButton>
      </WithdrawalsClip>
    </WithdrawalsCollapse>
  );
};
