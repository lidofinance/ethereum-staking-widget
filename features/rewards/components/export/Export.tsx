import { genExportData, saveAsCSV } from 'features/rewards/utils';
import { useRewardsHistory } from 'features/rewards/hooks';
import { backendRequest } from 'features/rewards/fetchers/backend';

import { ButtonStyle } from './Exportstyled';

import type { CurrencyType } from 'features/rewards/constants';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';

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
    trackEvent(...MATOMO_CLICK_EVENTS.rewardsExportCSV);
  };

  return (
    <ButtonStyle
      disabled={!data}
      onClick={triggerExport}
      color="primary"
      size="sm"
      variant="outlined"
      data-testid="exportBtn"
    >
      Export CSV
    </ButtonStyle>
  );
};
