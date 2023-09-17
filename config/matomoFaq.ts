import { MATOMO_CLICK_EVENTS } from './matomoClickEvents';

export const matomoEventMap = new Map();

matomoEventMap.set(
  'https://lido.fi/lido-ecosystem?tokens=stETH&categories=Get',
  MATOMO_CLICK_EVENTS.faqHowCanIUnstakeStEthIntegrations,
);
