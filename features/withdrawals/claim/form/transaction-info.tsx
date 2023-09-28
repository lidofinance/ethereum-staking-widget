import { DataTableRow } from '@lidofinance/lido-ui';
import { useClaimFormData } from '../claim-form-context';
import { useClaimTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';

export const TransactionInfo = () => {
  const { selectedRequests } = useClaimFormData();
  const { claimTxPriceInUsd, loading: claimTxPriceLoading } =
    useClaimTxPrice(selectedRequests);
  return (
    <DataTableRow title="Max transaction cost" loading={claimTxPriceLoading}>
      ${claimTxPriceInUsd?.toFixed(2)}
    </DataTableRow>
  );
};
