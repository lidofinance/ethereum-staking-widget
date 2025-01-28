import { FC, useState, useRef, ReactNode } from 'react';
import { DAPP_CHAIN_TYPE } from 'modules/web3';
import { useDappStatus } from 'modules/web3';

import { useClickOutside } from './hooks/use-click-outside';
import { ChainSwitcherOptions } from './components/chain-switcher-options/chain-switcher-options';
import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import {
  ChainSwitcherWrapperStyled,
  ChainSwitcherStyled,
  IconStyle,
  ArrowStyle,
} from './styles';

import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';
import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as SoneiumLogo } from 'assets/icons/chain-toggler/soneium.svg';

const iconsMap: Record<DAPP_CHAIN_TYPE, ReactNode> = {
  [DAPP_CHAIN_TYPE.Ethereum]: <EthereumMainnetLogo />,
  [DAPP_CHAIN_TYPE.Optimism]: <OptimismLogo />,
  [DAPP_CHAIN_TYPE.Soneium]: <SoneiumLogo />,
};

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainType, supportedChainTypes, setChainType } =
    useDappStatus();
  const [opened, setOpened] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const isChainTypeUnlocked = supportedChainTypes.length > 1;

  useClickOutside(selectRef, () => setOpened(false));

  return (
    <ChainSwitcherWrapperStyled>
      <ChainSwitcherStyled
        ref={selectRef}
        $disabled={!isChainTypeUnlocked}
        onClick={() => setOpened((prev) => !prev)}
      >
        <IconStyle>{iconsMap[chainType]}</IconStyle>
        {isChainTypeUnlocked && <ArrowStyle $opened={opened} />}
      </ChainSwitcherStyled>

      {isChainTypeUnlocked && (
        <>
          <ChainSwitcherOptions
            currentChainType={chainType}
            onSelect={(chainType) => {
              setChainType(chainType);
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
