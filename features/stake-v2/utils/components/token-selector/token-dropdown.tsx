import { useRef, useState, type ReactNode } from 'react';
import { Typography } from '@lidofinance/lido-app-ui';

import { TOKEN_SYMBOLS } from 'consts/tokens';
import { getPrettyChainName } from 'modules/web3';

import { TokenChainIcon } from '../token-chain-icon';

import type { TokenSelectorValue } from './types';
import { Chevron, SelectorPopover, SingleToken, Trigger } from './styles';

type TokenDropdownProps = {
  value: TokenSelectorValue;
  /** chip text; the token symbol when omitted */
  label?: ReactNode;
  /** accessible name of the chip; "<symbol> on <chain>" when omitted */
  ariaLabel?: string;
  /** nothing to pick: plain chip content, no button, no popover */
  isStatic?: boolean;
  /** accessible name of the popover */
  popoverLabel: string;
  /** popover content; it owns its padding, the panel has none */
  children: (close: () => void) => ReactNode;
};

/**
 * Token chip that opens a popover: the shell shared by the token pickers.
 * The popover content is mounted only while open.
 */
export const TokenDropdown = ({
  value,
  label,
  ariaLabel,
  isStatic = false,
  popoverLabel,
  children,
}: TokenDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const tokenLabel = TOKEN_SYMBOLS[value.token];
  const content = (
    <>
      <TokenChainIcon token={tokenLabel} chainId={value.chainId} size={24} />
      <Typography as="span" variant="bodyLarge" weight="semibold">
        {label ?? tokenLabel}
      </Typography>
    </>
  );

  if (isStatic) return <SingleToken>{content}</SingleToken>;

  return (
    <>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-label={
          ariaLabel ?? `${tokenLabel} on ${getPrettyChainName(value.chainId)}`
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        {content}
        <Chevron data-open={isOpen} />
      </Trigger>
      <SelectorPopover
        aria-label={popoverLabel}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={triggerRef}
        align="end"
      >
        {children(() => setIsOpen(false))}
      </SelectorPopover>
    </>
  );
};
