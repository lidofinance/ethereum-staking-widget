import { TOKENS } from '@lido-sdk/constants';
import { DataTableRow } from '@lidofinance/lido-ui';
import { useRequestTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { useApproveGasLimit } from 'features/wsteth/wrap/hooks/use-approve-gas-limit';
import { useWatch } from 'react-hook-form';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice } from 'shared/formatters';
import { useTxCostInUsd } from 'shared/hooks';
import {
  RequestFormInputType,
  useRequestFormData,
  useValidationResults,
} from '../request-form-context';
import { useWeb3 } from 'reef-knot/web3-react';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';

export const TransactionInfo = () => {
  const { active } = useWeb3();
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
  const {
    txCostUsd: approveTxCostInUsd,
    initialLoading: isApproveTxCostLoading,
  } = useTxCostInUsd(useApproveGasLimit());

  return (
    <>
      <DataTableRow
        data-testid="maxUnlockCost"
        help={unlockCostTooltip}
        title="Max unlock cost"
        loading={isApprovalFlowLoading || isApproveTxCostLoading}
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
      <AllowanceDataTableRow
        data-testid="allowance"
        token={token}
        allowance={allowance}
        isBlank={!active}
        loading={isApprovalFlowLoading}
      />
      {token === TOKENS.STETH ? (
        <DataTableRow data-testid="exchangeRate" title="Exchange rate">
          1 stETH = 1 ETH
        </DataTableRow>
      ) : (
        <DataTableRowStethByWsteth toSymbol="ETH" />
      )}
    </>
  );
};
