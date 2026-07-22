import { FC, useState, useMemo, createElement, ComponentType } from 'react';
import { Link } from '@lidofinance/lido-ui';
import {
  CHAIN_ICONS_MAP,
  getPrettyChainName,
  useDappStatus,
  wagmiChainMap,
} from 'modules/web3';

import {
  ChainSwitcherOptions,
  ChainOption,
} from './components/chain-switcher-options/chain-switcher-options';
import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import {
  ChainSwitcherWrapperStyled,
  ChainSwitcherStyled,
  IconStyle,
  ArrowStyle,
  LoaderStyled,
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

  const [opened, setOpened] = useState(false);
  const isLocked = useMemo(
    () => supportedChainIds.length < 2 || isSwitchChainPending,
    [supportedChainIds, isSwitchChainPending],
  );

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
    <ChainSwitcherWrapperStyled data-testid="chainSwitcher">
      <ChainSwitcherStyled
        data-testid={`currentChain=${chainId}`}
        $disabled={isLocked}
        onClick={() => {
          if (!isLocked) {
            setOpened((prev) => !prev);
          }
        }}
      >
        <IconStyle $loading={isSwitchChainPending}>
          {iconsMap[chainId].iconComponent}
        </IconStyle>
        {!isLocked && <ArrowStyle data-testid="canExpanded" $opened={opened} />}
        {isSwitchChainPending && <LoaderStyled />}
      </ChainSwitcherStyled>

      {!isLocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={(chainId) => {
              setOpened(false);
              requestChangeChain(chainId);
            }}
            setOpened={setOpened}
            opened={opened}
            options={iconsMap}
          />
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
        </>
      )}
    </ChainSwitcherWrapperStyled>
  );
};
