import { TOKENS } from '@lido-sdk/constants';
import { DataTableRow } from '@lidofinance/lido-ui';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { useApproveGasLimit } from 'features/wsteth/wrap/hooks/use-approve-gas-limit';
import { useWatch } from 'react-hook-form';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice, FormatToken } from 'shared/formatters';
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
  const approveGasLimit = useApproveGasLimit();
  const approveTxCostInUsd = useTxCostInUsd(
    approveGasLimit && Number(approveGasLimit),
  );

  const isInfiniteAllowance = useMemo(() => {
    return allowance.eq(MaxUint256);
  }, [allowance]);

  return (
    <>
      <DataTableRow
        data-testid="maxUnlockCost"
        help={unlockCostTooltip}
        title="Max unlock cost"
        loading={isApprovalFlowLoading}
      >
        {isApprovalFlow ? <FormatPrice amount={approveTxCostInUsd} /> : 'FREE'}
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxTxCost"
        loading={requestTxPriceLoading}
      >
        <FormatPrice amount={requestTxPriceInUsd} />
      </DataTableRow>
      <DataTableRow
        data-testid="allowance"
        title="Allowance"
        loading={isApprovalFlowLoading}
      >
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
        <DataTableRow data-testid="exchangeRate" title="Exchange rate">
          <span data-testid="selectedToken">1 stETH</span> ={' '}
          <span data-testid="destinationToken">1 ETH</span>
        </DataTableRow>
      ) : (
        <DataTableRowStethByWsteth toSymbol="ETH" />
      )}
    </>
  );
};
