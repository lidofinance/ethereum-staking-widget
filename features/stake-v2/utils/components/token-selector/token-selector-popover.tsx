import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Body, Caption, Description } from '@lidofinance/lido-app-ui';

import { getPrettyChainName, type TokenListItem } from 'modules/web3';
import { FormatPrice } from 'shared/formatters';
import { formatBalance } from 'utils';

import { Loader } from '../loader';
import { ChainIcon, TokenChainIcon } from '../token-chain-icon';

import { OPTION_SELECTOR, centerInView, moveListboxFocus } from './listbox';
import { isSameToken, type TokenSelectorValue } from './types';
import {
  ChainButton,
  ChainFilter,
  ListCaption,
  Option,
  OptionColumn,
  OptionList,
  PopoverContent,
} from './styles';

type TokenOptionProps = {
  option: TokenListItem;
  isLoading: boolean;
};

const TokenOption = ({ option, isLoading }: TokenOptionProps) => (
  <>
    <TokenChainIcon token={option.tokenLabel} chainId={option.chainId} />
    <OptionColumn>
      <Body as="span" weight="semibold">
        {option.tokenLabel}
      </Body>
      <Description as="span" color="secondary">
        {getPrettyChainName(option.chainId)}
      </Description>
    </OptionColumn>
    <OptionColumn data-align="end">
      <Loader isLoading={isLoading} variant="text" lines={2} width={64}>
        {option.balance !== undefined && (
          <>
            <Body as="span" weight="semibold">
              {
                formatBalance(option.balance, { decimals: option.decimals })
                  .trimmed
              }
            </Body>
            {option.usdValue !== undefined && (
              <Description as="span" color="secondary">
                <FormatPrice amount={option.usdValue} />
              </Description>
            )}
          </>
        )}
      </Loader>
    </OptionColumn>
  </>
);

type TokenSelectorPopoverProps = {
  value: TokenSelectorValue;
  onSelect: (value: TokenSelectorValue) => void;
  options: readonly TokenListItem[];
  isLoading: boolean;
  label?: ReactNode;
};

/** Mounted while the popover is open, so the chain filter resets on close */
export const TokenSelectorPopover = ({
  value,
  onSelect,
  options,
  isLoading,
  label,
}: TokenSelectorPopoverProps) => {
  const labelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const chainFilterRef = useRef<HTMLDivElement>(null);
  const [chainFilter, setChainFilter] = useState<number | null>(null);

  const chainIds = [...new Set(options.map(({ chainId }) => chainId))];
  const visible =
    chainFilter === null
      ? options
      : options.filter(({ chainId }) => chainId === chainFilter);
  const focusStop =
    visible.find((option) => isSameToken(option, value)) ?? visible[0];

  // centres the selected token and its chain once, on open
  useLayoutEffect(() => {
    centerInView(
      listRef.current,
      listRef.current?.querySelector<HTMLElement>(
        `${OPTION_SELECTOR}[aria-selected="true"]`,
      ),
    );
    centerInView(
      chainFilterRef.current,
      chainFilterRef.current?.querySelector<HTMLElement>(
        `[data-chain-id="${value.chainId}"]`,
      ),
    );
    // on open only: later value changes close the popover anyway
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PopoverContent>
      {chainIds.length > 1 && (
        <ChainFilter
          ref={chainFilterRef}
          role="group"
          aria-label="Filter by network"
        >
          <ChainButton
            type="button"
            aria-pressed={chainFilter === null}
            onClick={() => setChainFilter(null)}
          >
            <Body as="span" weight="semibold">
              All
            </Body>
          </ChainButton>
          {chainIds.map((chainId) => (
            <ChainButton
              key={chainId}
              type="button"
              data-chain-id={chainId}
              aria-pressed={chainFilter === chainId}
              aria-label={getPrettyChainName(chainId)}
              onClick={() => setChainFilter(chainId)}
            >
              <ChainIcon chainId={chainId} />
            </ChainButton>
          ))}
        </ChainFilter>
      )}

      {label && (
        <ListCaption>
          <Caption id={labelId} color="tertiary">
            {label}
          </Caption>
        </ListCaption>
      )}

      <OptionList
        ref={listRef}
        role="listbox"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : 'Tokens'}
        aria-busy={isLoading}
        onKeyDown={moveListboxFocus}
      >
        {visible.map((option) => (
          <Option
            key={`${option.chainId}-${option.token}`}
            type="button"
            role="option"
            aria-selected={isSameToken(option, value)}
            tabIndex={option === focusStop ? 0 : -1}
            onClick={() =>
              onSelect({ token: option.token, chainId: option.chainId })
            }
          >
            <TokenOption option={option} isLoading={isLoading} />
          </Option>
        ))}
      </OptionList>
    </PopoverContent>
  );
};
