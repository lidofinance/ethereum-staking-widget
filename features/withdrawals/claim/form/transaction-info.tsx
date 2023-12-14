import { DataTableRow } from '@lidofinance/lido-ui';
import { useClaimFormData } from '../claim-form-context';
import { useClaimTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { FormatPrice } from 'shared/formatters';

export const TransactionInfo = () => {
  const { selectedRequests } = useClaimFormData();
  const { claimTxPriceInUsd, loading: claimTxPriceLoading } =
    useClaimTxPrice(selectedRequests);
  return (
    <DataTableRow
      data-testid="maxTxCost"
      title="Max transaction cost"
      loading={claimTxPriceLoading}
    >
      <FormatPrice amount={claimTxPriceInUsd} />
    </DataTableRow>
  );
};
