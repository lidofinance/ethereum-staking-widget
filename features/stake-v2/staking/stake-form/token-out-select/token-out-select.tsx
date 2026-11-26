import { useController, useWatch } from 'react-hook-form';
import { SelectItem } from '@lidofinance/lido-app-ui';

import { TOKEN_SYMBOLS } from 'consts/tokens';
import { getPrettyChainName } from 'modules/web3';

import {
  TokenChainIcon,
  TokenDropdown,
  moveListboxFocus,
} from '../../../utils';
import {
  getTokenOutList,
  useStakeForm,
  useStakeFormContext,
  useStakingTokenOutList,
  type StakeTokenOutValue,
} from '../stake-form-context';

import { formatTokenOut, getTokenOutDetails } from './token-out-details';
import { useEthToWsteth } from './use-eth-to-wsteth';
import { RateLine, TokenOutList } from './styles';

const isSame = (a: StakeTokenOutValue, b: StakeTokenOutValue) =>
  a.token === b.token && a.chainId === b.chainId;

// TODO: move into a reusable token control
export const TokenOutSelect = () => {
  const { amountInEth } = useStakeForm();

  const { control } = useStakeFormContext();
  const tokenIn = useWatch({ control, name: 'tokenIn' });
  const { field } = useController({ control, name: 'tokenOut' });
  // the rate of the tokenIn chain, read once for every amount
  const ethToWsteth = useEthToWsteth(tokenIn.chainId);

  // what tokenIn can stake into, the same list the form adjusts tokenOut to
  const options = getTokenOutList(tokenIn, useStakingTokenOutList());

  const detailsArgs = {
    amountInEth,
    tokenInLabel: TOKEN_SYMBOLS[tokenIn.token],
    ethToWsteth,
  };
  const value = field.value;
  const valueLabel = formatTokenOut(
    TOKEN_SYMBOLS[value.token],
    getTokenOutDetails(value.token, detailsArgs)?.amountOut,
  );
  const focusStop = options.find((option) => isSame(option, value));

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
            const tokenLabel = TOKEN_SYMBOLS[option.token];
            const details = getTokenOutDetails(option.token, detailsArgs);
            const isSelected = isSame(option, value);
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
                label={formatTokenOut(tokenLabel, details?.amountOut)}
                secondaryLabel={getPrettyChainName(option.chainId)}
                description={
                  details && (
                    <>
                      {details.description}
                      {details.rate && <RateLine>{details.rate}</RateLine>}
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
