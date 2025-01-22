import {
  FC,
  useState,
  useRef,
  useMemo,
  createElement,
  ComponentType,
} from 'react';
import { CHAIN_ICONS_MAP, useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';

import { useClickOutside } from './hooks/use-click-outside';
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
  const { isDappActive, chainId, setChainId, supportedChainIds } =
    useDappStatus();
  const [opened, setOpened] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const isChainSwitcherUnlocked = supportedChainIds.length > 1;

  useClickOutside(selectRef, () => setOpened(false));

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
        ref={selectRef}
        $disabled={!isChainSwitcherUnlocked}
        onClick={() => setOpened((prev) => !prev)}
      >
        <IconStyle>{iconsMap[chainId].iconComponent}</IconStyle>
        {isChainSwitcherUnlocked && <ArrowStyle $opened={opened} />}
      </ChainSwitcherStyled>

      {isChainSwitcherUnlocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={(chainId) => {
              setChainId(chainId);
              setOpened(false);
            }}
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
