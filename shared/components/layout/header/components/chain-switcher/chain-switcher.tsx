import { FC, ReactNode, useState, useEffect, useRef } from 'react';

import { ReactComponent as OptimismLogo } from 'assets/icons/chain-toggler/optimism.svg';
import { ReactComponent as EthereumMainnetLogo } from 'assets/icons/chain-toggler/mainnet.svg';

import { DAPP_CHAIN_TYPE } from 'modules/web3';
import { useDappStatus } from 'modules/web3';

import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import {
  SelectStyled,
  SelectIconStyle,
  SelectArrowStyle,
  PopupMenuStyled,
  PopupMenuOptionStyled,
} from './styles';

const iconsMap: Record<DAPP_CHAIN_TYPE, ReactNode> = {
  [DAPP_CHAIN_TYPE.Ethereum]: <EthereumMainnetLogo />,
  [DAPP_CHAIN_TYPE.Optimism]: <OptimismLogo />,
};

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainType, supportedChainTypes, setChainType } =
    useDappStatus();

  const [opened, setOpened] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handlerOnClick = () => {
    setOpened((prev) => !prev);
  };

  const handleChainTypeSelect = (chainType: DAPP_CHAIN_TYPE) => {
    setChainType(chainType);
    setOpened(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setOpened(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isChainTypeUnlocked = supportedChainTypes.length > 1;

  return (
    <>
      <SelectStyled
        ref={selectRef}
        $disabled={!isChainTypeUnlocked}
        onClick={handlerOnClick}
      >
        <SelectIconStyle>{iconsMap[chainType]}</SelectIconStyle>
        {isChainTypeUnlocked && <SelectArrowStyle $opened={opened} />}
      </SelectStyled>

      <PopupMenuStyled $opened={opened}>
        <PopupMenuOptionStyled
          onClick={() => handleChainTypeSelect(DAPP_CHAIN_TYPE.Ethereum)}
          $active={DAPP_CHAIN_TYPE.Ethereum === chainType}
        >
          {iconsMap[DAPP_CHAIN_TYPE.Ethereum]} Ethereum
        </PopupMenuOptionStyled>
        <PopupMenuOptionStyled
          onClick={() => handleChainTypeSelect(DAPP_CHAIN_TYPE.Optimism)}
          $active={DAPP_CHAIN_TYPE.Optimism === chainType}
        >
          {iconsMap[DAPP_CHAIN_TYPE.Optimism]} Optimism
        </PopupMenuOptionStyled>
      </PopupMenuStyled>

      {isChainTypeUnlocked && !isDappActive && (
        <SelectIconTooltip showArrow={true}>
          This network doesn’t match your wallet’s network
        </SelectIconTooltip>
      )}
    </>
  );
};
