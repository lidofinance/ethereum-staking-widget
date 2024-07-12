import { trackEvent } from '@lidofinance/analytics-matomo';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';

const OPTIONS = [
  {
    label: 'Lido (stETH)',
    token: TOKENS_TO_WRAP.STETH,
  },
  {
    label: 'Ethereum (ETH)',
    token: TOKENS_TO_WRAP.ETH,
  },
];

type TokenSelectWrapProps = Pick<
  React.ComponentProps<typeof TokenSelectHookForm>,
  'warning'
>;

export const TokenSelectWrap = (props: TokenSelectWrapProps) => {
  const { isDappActive } = useDappStatuses();

  return (
    <TokenSelectHookForm
      disabled={!isDappActive}
      options={OPTIONS}
      onChange={(value) => {
        trackEvent(
          ...(value === TOKENS_TO_WRAP.ETH
            ? MATOMO_CLICK_EVENTS.wrapTokenSelectEth
            : MATOMO_CLICK_EVENTS.wrapTokenSelectSteth),
        );
      }}
      {...props}
    />
  );
};
