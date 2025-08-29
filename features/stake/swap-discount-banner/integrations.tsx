import { parseEther } from 'viem';
import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'consts/external-links';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';
import { use1inchDeepLinkProps } from 'features/stake/hooks';
import { getOneInchRate } from 'utils/get-one-inch-rate';
import { getOpenOceanRate } from 'utils/get-open-ocean-rate';

import {
  StakeSwapDiscountIntegrationKey,
  StakeSwapDiscountIntegrationMap,
} from './types';
import { OpenOceanIcon, OneInchIcon, OverlayLink } from './styles';
import { TOKENS_TO_WITHDRAWLS } from '../../withdrawals/types/tokens-withdrawable';

const DEFAULT_AMOUNT = parseEther('1');

const STAKE_SWAP_INTEGRATION_CONFIG: StakeSwapDiscountIntegrationMap = {
  'open-ocean': {
    title: 'OpenOcean',
    async getRate() {
      const { rate } = await getOpenOceanRate(
        DEFAULT_AMOUNT,
        'ETH',
        TOKENS_TO_WITHDRAWLS.stETH,
      );
      return rate;
    },
    BannerText({ discountPercent }) {
      return (
        <>
          Get a <b>{discountPercent.toFixed(2)}% discount</b> by swapping to
          stETH&nbsp;on the OpenOcean platform
        </>
      );
    },
    Icon: OpenOceanIcon,
    linkHref: `https://app.openocean.finance/classic?referrer=${OPEN_OCEAN_REFERRAL_ADDRESS}#/ETH/ETH/STETH`,
    matomoEvent: MATOMO_CLICK_EVENTS.openOceanDiscount,
  },
  'one-inch': {
    title: '1inch',
    async getRate() {
      const result = await getOneInchRate({ token: LIDO_TOKENS.eth });
      return result.rate;
    },
    BannerText({ discountPercent }) {
      return (
        <>
          Get a <b>{discountPercent.toFixed(2)}% discount</b> by swapping to
          stETH&nbsp;on the 1inch platform
        </>
      );
    },
    Icon: OneInchIcon,
    linkHref: `https://app.1inch.io/#/1/advanced/swap/ETH/stETH`,
    matomoEvent: MATOMO_CLICK_EVENTS.oneInchDiscount,
    CustomLink({ children, ...props }) {
      const customProps = use1inchDeepLinkProps();
      return (
        <OverlayLink {...props} {...customProps}>
          {children}
        </OverlayLink>
      );
    },
  },
};

export const getSwapIntegration = (key: StakeSwapDiscountIntegrationKey) =>
  STAKE_SWAP_INTEGRATION_CONFIG[key];
