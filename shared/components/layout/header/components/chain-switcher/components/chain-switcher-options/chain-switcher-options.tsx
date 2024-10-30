import { FC, ReactNode } from 'react';
import { DAPP_CHAIN_TYPE } from 'modules/web3';

import { PopoverWrapperStyled, PopupStyled, OptionStyled } from './styles';

interface ChainSwitcherOptionsProps {
  currentChainType: DAPP_CHAIN_TYPE;
  onSelect: (chainType: DAPP_CHAIN_TYPE) => void;
  opened: boolean;
  options: Record<DAPP_CHAIN_TYPE, ReactNode>;
}

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainType,
  onSelect,
  opened,
  options,
}) => (
  // We need the 'PopoverWrapperStyled' for block any events as if you had set 'pointer-events: none' on the body
  // while the 'PopupStyled' is opened
  <PopoverWrapperStyled $backdrop={opened}>
    <PopupStyled $opened={opened}>
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
  </PopoverWrapperStyled>
);
