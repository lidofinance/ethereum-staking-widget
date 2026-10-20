import { callMatomo } from '@lidofinance/analytics-matomo';
import {
  MATOMO_EVENTS,
  MATOMO_EVENT_TYPE,
  MATOMO_DIMENSIONS,
  getMatomoChainSlug,
  getMatomoTokenSlug,
} from 'consts/matomo';
import { overrideWithQAMockBoolean } from './qa';
import { getTrackedChain } from './tracked-chain';

export type MatomoEventParams = {
  // defaults to the wallet chain, "disconnected" without one
  chainId?: number;
  token?: string;
  // Matomo's numeric event metric, summed and averaged per event in reports.
  // Callers convert on their side, e.g. weiToEth(amount)
  value?: number;
};

// Every event carries the chain dimension; the token one only when given
const getCustomData = ({ chainId, token }: MatomoEventParams) => ({
  [`dimension${MATOMO_DIMENSIONS.chain}`]: getMatomoChainSlug(
    chainId ?? getTrackedChain(),
  ),
  ...(token && {
    [`dimension${MATOMO_DIMENSIONS.token}`]: getMatomoTokenSlug(token),
  }),
});

export const trackMatomoEvent = (
  eventType: MATOMO_EVENT_TYPE,
  params: MatomoEventParams = {},
) => {
  const event = MATOMO_EVENTS[eventType];
  const customData = getCustomData(params);

  const enableLogging = overrideWithQAMockBoolean(
    false,
    'mock-qa-helpers-matomo-logging',
  );
  if (enableLogging) {
    console.info(
      '%cTracking Matomo event:',
      'background:#3152A0;color:#fff;padding:2px 4px;border-radius:2px',
      [...event, params.value, JSON.stringify(customData)].join(', '),
    );
  }

  // Matomo signature: trackEvent(category, action, name, value, customData).
  // An undefined value is "not set" for the tracker, not 0; it is still passed
  // because the dimensions live in the next positional slot
  callMatomo('trackEvent', ...event, params.value, customData);
};
