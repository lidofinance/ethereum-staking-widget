import { FC } from 'react';
import CurrencySelector from 'features/rewards/components/CurrencySelector';
import { Export } from 'features/rewards/components/export';

import { RightOptionsWrapper } from './styles';
import { useRewardsHistory } from 'features/rewards/hooks/useRewardsHistory';
import { MatomoEventType, trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';

const MATOMO_EVENTS_MAP_CURRENCY_SELECTOR: Record<string, MatomoEventType> = {
  usd: MATOMO_CLICK_EVENTS.rewardsHistoricalCurrencyUSD,
  eur: MATOMO_CLICK_EVENTS.rewardsHistoricalCurrencyEUR,
  gbp: MATOMO_CLICK_EVENTS.rewardsHistoricalCurrencyGBP,
};

export const RightOptions: FC = () => {
  const {
    address,
    currencyObject,
    setCurrency,
    isUseArchiveExchangeRate,
    isIncludeTransfers,
  } = useRewardsHistory();
  return (
    <RightOptionsWrapper>
      <CurrencySelector
        currency={currencyObject}
        onChange={(value) => {
          const event = MATOMO_EVENTS_MAP_CURRENCY_SELECTOR[value];
          if (event) trackEvent(...event);
          setCurrency(value);
        }}
      />
      <Export
        currency={currencyObject}
        address={address}
        archiveRate={isUseArchiveExchangeRate}
        onlyRewards={!isIncludeTransfers}
      />
    </RightOptionsWrapper>
  );
};
