import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { isDappActive } = useDappStatuses();

  return <TokenSelectHookForm disabled={!isDappActive} options={OPTIONS} />;
};
