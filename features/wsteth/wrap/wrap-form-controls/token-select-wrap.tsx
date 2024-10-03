import { useMemo } from 'react';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

const OPTION_STETH = {
  label: 'Lido (stETH)',
  token: TOKENS_TO_WRAP.STETH,
};

const OPTION_ETH = {
  label: 'Ethereum (ETH)',
  token: TOKENS_TO_WRAP.ETH,
};

type TokenSelectWrapProps = Pick<
  React.ComponentProps<typeof TokenSelectHookForm>,
  'warning'
>;

export const TokenSelectWrap = (props: TokenSelectWrapProps) => {
  const { isWalletConnected, isDappActive, isDappActiveOnL2 } = useDappStatus();

  const options = useMemo(() => {
    if (isDappActiveOnL2) {
      return [OPTION_STETH];
    } else {
      return [OPTION_STETH, OPTION_ETH];
    }
  }, [isDappActiveOnL2]);

  return (
    <TokenSelectHookForm
      disabled={isWalletConnected && !isDappActive}
      options={options}
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
