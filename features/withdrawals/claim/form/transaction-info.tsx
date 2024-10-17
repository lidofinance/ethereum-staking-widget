import { DataTableRow } from '@lidofinance/lido-ui';
import { useClaimFormData } from '../claim-form-context';
import { useClaimTxPrice } from 'features/withdrawals/hooks/useWithdrawTxPrice';
import { FormatPrice } from 'shared/formatters';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

export const TransactionInfo = () => {
  const { isDappActive, isAccountActiveOnL2 } = useDappStatus();

  const { selectedRequests } = useClaimFormData();
  const { claimTxPriceInUsd, loading: claimTxPriceLoading } =
    useClaimTxPrice(selectedRequests);
  return (
    <DataTableRow
      data-testid="maxTxCost"
      title="Max transaction cost"
      loading={claimTxPriceLoading}
    >
      {!isDappActive || isAccountActiveOnL2 ? (
        '-'
      ) : (
        <FormatPrice amount={claimTxPriceInUsd} />
      )}
    </DataTableRow>
  );
};
