import { FC, useMemo, createElement, ComponentType } from 'react';
import { Link, Loader } from '@lidofinance/lido-ui';
import {
  CHAIN_ICONS_MAP,
  getPrettyChainName,
  useDappStatus,
  wagmiChainMap,
} from 'modules/web3';
import { usePopupMenu } from 'shared/components/layout/header/components/popup';

import {
  ChainSwitcherOptions,
  ChainOption,
} from './components/chain-switcher-options';
import { SelectIconTooltip } from './components/select-icon-tooltip';
import {
  ChainSwitcherWrapperStyled,
  ChainSwitcherStyled,
  IconStyle,
  ArrowStyle,
} from './styles';

type IconsMapType = Record<number, ChainOption>;

const overriddenChainNames: Record<number, string> = {
  10: 'Optimism',
  130: 'Unichain',
};

export const ChainSwitcher: FC = () => {
  const {
    isDappActive,
    chainId,
    canSwitchChain,
    isSwitchChainPending,
    supportedChainIds,
    requestChangeChain,
  } = useDappStatus();
  const isLocked = useMemo(
    () => supportedChainIds.length < 2 || isSwitchChainPending,
    [supportedChainIds, isSwitchChainPending],
  );
  const {
    opened,
    close,
    wrapperProps,
    triggerProps,
    menuProps,
    backdropProps,
  } = usePopupMenu({ mode: 'button', disabled: isLocked });

  const iconsMap = useMemo(
    () =>
      supportedChainIds.reduce((acc: IconsMapType, chainId: number) => {
        acc[chainId] = {
          name: overriddenChainNames[chainId] ?? wagmiChainMap[chainId].name,
          iconComponent: CHAIN_ICONS_MAP.has(Number(chainId))
            ? createElement(
                CHAIN_ICONS_MAP.get(Number(chainId)) as ComponentType,
              )
            : null,
        };
        return acc;
      }, {}),
    [supportedChainIds],
  );

  return (
    <ChainSwitcherWrapperStyled data-testid="chainSwitcher" {...wrapperProps}>
      <ChainSwitcherStyled
        type="button"
        data-testid={`currentChain=${chainId}`}
        aria-disabled={isLocked}
        $disabled={isLocked}
        $loading={isSwitchChainPending}
        {...triggerProps}
      >
        <IconStyle $loading={isSwitchChainPending}>
          {iconsMap[chainId].iconComponent}
        </IconStyle>
        {!isLocked && <ArrowStyle data-testid="canExpanded" $opened={opened} />}
        {isSwitchChainPending && <Loader size="small" />}
      </ChainSwitcherStyled>

      {!isLocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={(chainId) => {
              close();
              requestChangeChain(chainId);
            }}
            opened={opened}
            options={iconsMap}
            menuProps={menuProps}
            backdropProps={backdropProps}
          />
        </>
      )}
      {!isDappActive && (
        <SelectIconTooltip showArrow>
          This network doesn’t match your wallet’s network.{' '}
          {canSwitchChain && (
            <>
              <br />
              <Link
                href="#"
                aria-disabled={isSwitchChainPending}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSwitchChainPending) requestChangeChain(chainId);
                }}
              >
                Switch to {getPrettyChainName(chainId)}.
              </Link>
            </>
          )}
        </SelectIconTooltip>
      )}
    </ChainSwitcherWrapperStyled>
  );
};
