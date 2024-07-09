import { trackEvent } from '@lidofinance/analytics-matomo';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

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
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();

  return (
    <TokenSelectHookForm
      disabled={!isActiveWallet}
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
