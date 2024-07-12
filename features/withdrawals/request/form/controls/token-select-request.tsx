import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { isDappActive } = useConnectionStatuses();

  return <TokenSelectHookForm disabled={!isDappActive} options={OPTIONS} />;
};
