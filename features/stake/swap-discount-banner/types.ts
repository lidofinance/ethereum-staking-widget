import { MatomoEventType } from '@lidofinance/analytics-matomo';

export type StakeSwapDiscountIntegrationKey = 'open-ocean' | 'one-inch';

export type StakeSwapDiscountIntegrationValue = {
  title: string;
  getRate: () => Promise<number>;
  linkHref: string;
  CustomLink?: React.FC<React.PropsWithoutRef<React.ComponentProps<'a'>>>;
  matomoEvent: MatomoEventType;
  BannerText: React.FC<{ discountPercent: number }>;
  Icon: React.FC;
};

export type StakeSwapDiscountIntegrationMap = Record<
  StakeSwapDiscountIntegrationKey,
  StakeSwapDiscountIntegrationValue
>;

export type FetchRateResult = {
  rate: number;
  shouldShowDiscount: boolean;
  discountPercent: number;
};
