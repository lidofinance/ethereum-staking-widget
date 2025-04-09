import { FC, useState, useMemo, createElement, ComponentType } from 'react';
import { CHAIN_ICONS_MAP, useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';

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
} from './styles';

type IconsMapType = Record<number, ChainOption>;

const overriddenChainNames: Record<number, string> = {
  10: 'Optimism',
  1868: 'Soneium',
  130: 'Unichain',
};

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainId, setChainId, supportedChainIds } =
    useDappStatus();

  const [opened, setOpened] = useState(false);
  const isLocked = useMemo(
    () => supportedChainIds.length < 2,
    [supportedChainIds],
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
        <IconStyle>{iconsMap[chainId].iconComponent}</IconStyle>
        {!isLocked && <ArrowStyle data-testid="canExpanded" $opened={opened} />}
      </ChainSwitcherStyled>

      {!isLocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={(chainId) => {
              setOpened(false);
              setChainId(chainId);
            }}
            setOpened={setOpened}
            opened={opened}
            options={iconsMap}
          />
          {!isDappActive && (
            <SelectIconTooltip showArrow>
              This network doesn’t match your wallet’s network
            </SelectIconTooltip>
          )}
        </>
      )}
    </ChainSwitcherWrapperStyled>
  );
};
