import { TOKENS } from '@lido-sdk/constants';
import { DataTableRow } from '@lidofinance/lido-ui';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { useApproveGasLimit } from 'features/wrap/features/wrap-form/hooks';
import { useWatch } from 'react-hook-form';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatToken } from 'shared/formatters';
import { useTxCostInUsd } from 'shared/hooks';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import {
  RequestFormInputType,
  useRequestFormData,
  useValidationResults,
} from '../request-form-context';
import { MaxUint256 } from '@ethersproject/constants';
import { useMemo } from 'react';

export const TransactionInfo = () => {
  const { isApprovalFlow, isApprovalFlowLoading, allowance } =
    useRequestFormData();
  const token = useWatch<RequestFormInputType, 'token'>({ name: 'token' });
  const { requests } = useValidationResults();
  const unlockCostTooltip = isApprovalFlow ? undefined : (
    <>Lido leverages gasless token approvals via ERC-2612 permits</>
  );
  const { txPriceUsd: requestTxPriceInUsd, loading: requestTxPriceLoading } =
    useRequestTxPrice({
      token,
      isApprovalFlow,
      requestCount: requests?.length,
    });
  const approveTxCostInUsd = useTxCostInUsd(useApproveGasLimit());

  const isInfiniteAllowance = useMemo(() => {
    return allowance.eq(MaxUint256);
  }, [allowance]);

  return (
    <>
      <DataTableRow
        help={unlockCostTooltip}
        title="Max unlock cost"
        loading={isApprovalFlowLoading}
      >
        {isApprovalFlow ? `$${approveTxCostInUsd?.toFixed(2)}` : 'FREE'}
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        loading={requestTxPriceLoading}
      >
        ${requestTxPriceInUsd?.toFixed(2)}
      </DataTableRow>
      <DataTableRow title="Allowance" loading={isApprovalFlowLoading}>
        {isInfiniteAllowance ? (
          'Infinite'
        ) : (
          <FormatToken
            showAmountTip
            amount={allowance}
            symbol={getTokenDisplayName(token)}
          />
        )}
      </DataTableRow>
      {token === TOKENS.STETH ? (
        <DataTableRow title="Exchange rate">1 stETH = 1 ETH</DataTableRow>
      ) : (
        <DataTableRowStethByWsteth toSymbol="ETH" />
      )}
    </>
  );
};
