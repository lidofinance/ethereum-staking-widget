import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { TokenSelectHookForm } from 'shared/hook-form/controls/token-select-hook-form/token-select-hook-form';
import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';

const OPTIONS = [
  { label: 'Ethereum (ETH)', token: TOKENS_TO_STAKE.ETH },
  { label: 'Wrapped Ether (WETH)', token: TOKENS_TO_STAKE.WETH },
];

type StakeTokenSelectProps = Pick<
  React.ComponentProps<typeof TokenSelectHookForm>,
  'warning'
>;

export const StakeTokenSelect = (props: StakeTokenSelectProps) => {
  const { isWalletConnected, isDappActive } = useDappStatus();

  return (
    <TokenSelectHookForm
      disabled={isWalletConnected && !isDappActive}
      options={OPTIONS}
      onChange={(token) => {
        trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.stakeTokenSelect, { token });
      }}
      {...props}
    />
  );
};
