import { FC, ReactNode, useRef } from 'react';
import { DAPP_CHAIN_TYPE } from 'modules/web3';

import { useClickOutside } from '../../hooks/use-click-outside';

import { PopoverWrapperStyled, PopupStyled, OptionStyled } from './styles';

interface ChainSwitcherOptionsProps {
  currentChainType: DAPP_CHAIN_TYPE;
  onSelect: (chainType: DAPP_CHAIN_TYPE) => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  options: Record<DAPP_CHAIN_TYPE, ReactNode>;
}

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainType,
  onSelect,
  setOpened,
  opened,
  options,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useClickOutside(popupRef, () => setOpened(false));

  return (
    // We need the 'PopoverWrapperStyled' for block any events as if you had set 'pointer-events: none' on the body
    // while the 'PopupStyled' is opened
    <>
      <PopoverWrapperStyled $backdrop={opened} />
      <PopupStyled $opened={opened} ref={popupRef}>
        {Object.entries(options).map(([chainType, icon]) => (
          <OptionStyled
            key={chainType}
            onClick={() => onSelect(chainType as DAPP_CHAIN_TYPE)}
            $active={chainType === currentChainType}
          >
            {icon} <span>{chainType}</span>
          </OptionStyled>
        ))}
      </PopupStyled>
    </>
  );
};
