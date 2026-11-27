import { useController, useWatch } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { SelectItem } from '@lidofinance/lido-app-ui';

import { getPrettyChainName } from 'modules/web3';

import {
  TokenChainIcon,
  TokenDropdown,
  isSameTokenOnChain,
  moveListboxFocus,
  tokenSymbol,
  useRouteQuotes,
} from '../../../utils';
import {
  getTokenOutList,
  useStakeForm,
  useStakeFormContext,
  useStakingTokenOutList,
} from '../stake-form-context';
import type { StakeRouteSpec } from '../stake-routes';

import {
  ONE_TOKEN_IN,
  formatRate,
  formatTokenOut,
  getTokenOutDescription,
} from './token-out-details';
import { RateLine, TokenOutList } from './styles';

// TODO: move into a reusable token control
export const TokenOutSelect = () => {
  const { routing } = useStakeForm();

  const { control } = useStakeFormContext();
  const tokenIn = useWatch({ control, name: 'tokenIn' });
  const amount = useWatch({ control, name: 'amount' });
  const { field } = useController({ control, name: 'tokenOut' });

  // what tokenIn can stake into, the same list the form adjusts tokenOut to;
  // every option has a route, so each is quoted by its own route
  const options = getTokenOutList(tokenIn, useStakingTokenOutList());
  const entries = options.map((tokenOut) => {
    const route = routing.resolve({ tokenIn, tokenOut });
    invariant(route, 'every token out option must have a stake route');
    return { route, deps: routing.getQuoteDeps({ tokenIn, tokenOut }) };
  });
  const quotes = useRouteQuotes<StakeRouteSpec>(entries, amount);
  // the rate line: the same quote, for one whole token
  const rates = useRouteQuotes<StakeRouteSpec>(entries, ONE_TOKEN_IN);
  const tokenInLabel = tokenSymbol(tokenIn.token);
  const describe = (index: number) => {
    const option = options[index];
    const quote = quotes[index];
    const rate = rates[index];
    invariant(option && quote && rate, 'a quote per option');
    const tokenLabel = tokenSymbol(option.token);
    return {
      option,
      tokenLabel,
      label: formatTokenOut(tokenLabel, quote.quote?.amountOut),
      description: getTokenOutDescription(option.token),
      rate: formatRate(tokenInLabel, tokenLabel, rate.quote?.amountOut),
    };
  };

  const value = field.value;
  const selectedIndex = options.findIndex((option) =>
    isSameTokenOnChain(option, value),
  );
  const valueLabel =
    selectedIndex === -1
      ? tokenSymbol(value.token)
      : describe(selectedIndex).label;
  const focusStop = options.find((option) => isSameTokenOnChain(option, value));

  return (
    <TokenDropdown
      value={value}
      label={valueLabel}
      ariaLabel={`Receive ${valueLabel} on ${getPrettyChainName(value.chainId)}`}
      isStatic={options.length === 1}
      popoverLabel="Select token to receive"
    >
      {(close) => (
        <TokenOutList
          role="listbox"
          aria-label="Tokens to receive"
          onKeyDown={moveListboxFocus}
        >
          {options.map((option, index) => {
            const { tokenLabel, label, description, rate } = describe(index);
            const isSelected = isSameTokenOnChain(option, value);
            const isFocusStop = focusStop ? option === focusStop : index === 0;

            return (
              <SelectItem
                key={`${option.chainId}-${option.token}`}
                as="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocusStop ? 0 : -1}
                selected={isSelected}
                labelWeight="semibold"
                icon={
                  <TokenChainIcon
                    token={tokenLabel}
                    chainId={option.chainId}
                    size={24}
                  />
                }
                label={label}
                secondaryLabel={getPrettyChainName(option.chainId)}
                description={
                  (description || rate) && (
                    <>
                      {description}
                      {rate && <RateLine>{rate}</RateLine>}
                    </>
                  )
                }
                onClick={() => {
                  close();
                  field.onChange(option);
                }}
              />
            );
          })}
        </TokenOutList>
      )}
    </TokenDropdown>
  );
};
