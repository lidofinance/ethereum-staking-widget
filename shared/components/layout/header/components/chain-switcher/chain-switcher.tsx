import { FC, useState, useMemo, createElement, ComponentType } from 'react';
import { ToastInfo } from '@lidofinance/lido-ui';

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

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainId, switchChainId, supportedChainIds } =
    useDappStatus();

  const [opened, setOpened] = useState(false);
  const [isLocked, setIsLocked] = useState(supportedChainIds.length < 2);

  const iconsMap = useMemo(
    () =>
      supportedChainIds.reduce((acc: IconsMapType, chainId: number) => {
        acc[chainId] = {
          name: wagmiChainMap[chainId].name,
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
    <ChainSwitcherWrapperStyled>
      <ChainSwitcherStyled
        $disabled={isLocked}
        $showArrow={!isLocked}
        onClick={() => {
          if (!isLocked) {
            setOpened((prev) => !prev);
          }
        }}
      >
        <IconStyle>{iconsMap[chainId].iconComponent}</IconStyle>
        {!isLocked && <ArrowStyle $opened={opened} />}
      </ChainSwitcherStyled>

      {!isLocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={async (chainId) => {
              setOpened(false);
              setIsLocked(true);
              try {
                await switchChainId(chainId);
              } catch (err) {
                console.warn(`[chain-switcher.tsx] ${err}`);
                ToastInfo(String(err));
              } finally {
                setIsLocked(false);
              }
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
