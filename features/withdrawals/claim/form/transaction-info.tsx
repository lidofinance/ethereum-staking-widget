import { DataTableRow } from '@lidofinance/lido-ui';
import { useClaimFormData } from '../claim-form-context';
import { useWithdrawClaimTxPrice } from 'features/withdrawals/hooks/use-withdraw-claim-tx-price';
import { FormatPrice } from 'shared/formatters';

export const TransactionInfo = () => {
  const { selectedRequests } = useClaimFormData();
  const { claimTxPriceInUsd, loading: claimTxPriceLoading } =
    useWithdrawClaimTxPrice(selectedRequests);

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
