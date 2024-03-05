import { parseEther } from '@ethersproject/units';
import { TOKENS } from '@lido-sdk/constants';
import { useLidoSWR } from '@lido-sdk/react';
import { Button } from '@lidofinance/lido-ui';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'consts/external-links';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';

import { Wrap, TextWrap, OpenOceanIcon, OverlayLink } from './styles';

const SWAP_URL = `https://app.openocean.finance/classic?referrer=${OPEN_OCEAN_REFERRAL_ADDRESS}#/ETH/ETH/STETH`;
const DISCOUNT_THRESHOLD = 1.004;
const DEFAULT_AMOUNT = parseEther('1');
const MOCK_LS_KEY = 'mock-qa-helpers-discount-rate';

type FetchRateResult = {
  rate: number;
  shouldShowDiscount: boolean;
  discountPercent: number;
};

const calculateDiscountState = (rate: number): FetchRateResult => ({
  rate,
  shouldShowDiscount: rate > DISCOUNT_THRESHOLD,
  discountPercent: (1 - 1 / rate) * 100,
});

// we show banner if STETH is considerably cheaper to get on dex than staking
// ETH -> stETH rate > THRESHOLD
const fetchRate = async (): Promise<FetchRateResult> => {
  const { rate } = await getOpenOceanRate(DEFAULT_AMOUNT, 'ETH', TOKENS.STETH);
  return calculateDiscountState(rate);
};

const linkClickHandler = () =>
  trackEvent(...MATOMO_CLICK_EVENTS.openOceanDiscount);

if (config.enableQaHelpers && typeof window !== 'undefined') {
  (window as any).setMockDiscountRate = (rate?: number) =>
    rate === undefined
      ? localStorage.removeItem(MOCK_LS_KEY)
      : localStorage.setItem(MOCK_LS_KEY, rate.toString());
}

const getData = (data: FetchRateResult | undefined) => {
  if (!config.enableQaHelpers || typeof window == 'undefined') return data;
  const mock = localStorage.getItem(MOCK_LS_KEY);
  if (mock) {
    return calculateDiscountState(parseFloat(mock));
  }
  return data;
};

export const SwapDiscountBanner = ({ children }: React.PropsWithChildren) => {
  const swr = useLidoSWR<FetchRateResult>(
    ['swr:open-ocean-rate'],
    fetchRate,
    STRATEGY_LAZY,
  );

  const data = getData(swr.data);

  if (swr.initialLoading) return null;

  if (!data?.shouldShowDiscount) return <>{children}</>;

  return (
    <Wrap>
      <OpenOceanIcon />
      <TextWrap>
        Get a <b>{data?.discountPercent.toFixed(2)}% discount</b> by swapping to
        stETH&nbsp;on the OpenOcean platform
      </TextWrap>
      <OverlayLink
        target="_blank"
        rel="noreferrer"
        href={SWAP_URL}
        onClick={linkClickHandler}
      >
        <Button fullwidth size="xs">
          Get discount
        </Button>
      </OverlayLink>
    </Wrap>
  );
};
