import { genExportData, saveAsCSV } from 'features/rewards/utils';
import { useRewardsHistory } from 'features/rewards/hooks';
import { backendRequest } from 'features/rewards/fetchers/requesters';

import { ButtonStyle } from './Exportstyled';

import type { CurrencyType } from 'features/rewards/constants';

type ExportProps = {
  currency: CurrencyType;
  address: string;
  archiveRate: boolean;
  onlyRewards: boolean;
};

export const Export = ({
  currency: currencyObject,
  address,
  currency,
  archiveRate,
  onlyRewards,
}: ExportProps) => {
  const { data } = useRewardsHistory();

  const triggerExport = async () => {
    // Ignoring any other options eg limit or skip
    // const { address, currency, archiveRate, onlyRewards } = backendOptions;
    const result = await backendRequest({
      address,
      currency: currency.code,
      archiveRate,
      onlyRewards,
    });
    const formatted = genExportData(currencyObject, result.events);
    saveAsCSV(formatted);
  };

  return (
    <ButtonStyle
      disabled={!data}
      onClick={triggerExport}
      color="primary"
      size="sm"
      variant="outlined"
    >
      Export CSV
    </ButtonStyle>
  );
};
