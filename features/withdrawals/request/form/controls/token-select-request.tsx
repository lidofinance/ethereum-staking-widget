import { useWeb3 } from 'reef-knot/web3-react';
import {
  TOKENS,
  TokenOption,
  TokenSelectHookForm,
} from 'shared/hook-form/controls/token-select-hook-form';

const OPTIONS: TokenOption[] = [
  { token: TOKENS.STETH },
  { token: TOKENS.WSTETH },
];

export const TokenSelectRequest = () => {
  const { active } = useWeb3();

  return <TokenSelectHookForm disabled={!active} options={OPTIONS} />;
};
