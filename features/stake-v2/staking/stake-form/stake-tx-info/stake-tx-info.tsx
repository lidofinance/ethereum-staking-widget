import { DataList, DataListRow } from '@lidofinance/lido-app-ui';
import { DATA_UNAVAILABLE } from 'consts/text';
import { Loader } from 'features/stake-v2/utils';
import { FormatPercent } from 'shared/formatters';
import { useProtocolFee } from 'shared/hooks/use-protocol-fee';

export const StakeTxInfo = () => {
  const { data: protocolFee, isLoading: isFeeLoading } = useProtocolFee();

  return (
    <DataList>
      <DataListRow
        label="Reward fee"
        data-testid="lidoFee"
        info="Please note: this fee applies to staking rewards only,
              and is NOT taken from your staked amount."

        value={
          <Loader isLoading={isFeeLoading}>
            {protocolFee ? (
              <FormatPercent
                value={protocolFee.totalFeePercent}
                decimals="percent"
              />
            ) : (
              DATA_UNAVAILABLE
            )}
          </Loader>
        }
      ></DataListRow>
    </DataList>
  );
};
