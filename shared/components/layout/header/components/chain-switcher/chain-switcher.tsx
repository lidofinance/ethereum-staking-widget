import { FC, useState, useRef } from 'react';
import { useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';
import { getChainTypeByChainId, DAPP_CHAIN_TYPE } from 'modules/web3/consts';
import { config } from 'config';

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

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

type IconsMapType = Record<number, ChainOption>;

const iconsMap: IconsMapType = config.supportedChains.reduce(
  (acc: IconsMapType, chainId: number) => {
    acc[chainId] = {
      name: wagmiChainMap[chainId].name,
      iconComponent:
        getChainTypeByChainId(chainId) === DAPP_CHAIN_TYPE.Optimism ? (
          <OptimismLogo />
        ) : (
          <EthereumMainnetLogo />
        ),
    };
    return acc;
  },
  {},
);

export const ChainSwitcher: FC = () => {
  const {
    isDappActive,
    chainId,
    setChainId,
    supportedChainIds,
    isSwitchChainWait,
  } = useDappStatus();
  const [opened, setOpened] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const isChainSwitcherUnlocked = supportedChainIds.length > 1;

  useClickOutside(selectRef, () => setOpened(false));

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
          {!isDappActive && !isSwitchChainWait && (
            <SelectIconTooltip showArrow>
              This network doesn’t match your wallet’s network
            </SelectIconTooltip>
          )}
        </>
      )}
    </ChainSwitcherWrapperStyled>
  );
};
