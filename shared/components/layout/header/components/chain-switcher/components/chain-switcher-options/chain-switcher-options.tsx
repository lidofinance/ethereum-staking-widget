import { FC, ReactNode } from 'react';

import { PopoverWrapperStyled, PopupStyled, OptionStyled } from './styles';

export type ChainOption = { name: string; iconComponent: ReactNode };

interface ChainSwitcherOptionsProps {
  currentChainId: number;
  onSelect: (chainId: number) => void;
  opened: boolean;
  options: Record<number, ChainOption>;
}

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainId,
  onSelect,
  opened,
  options,
}) => (
  // We need the 'PopoverWrapperStyled' for block any events as if you had set 'pointer-events: none' on the body
  // while the 'PopupStyled' is opened
  <>
    <PopoverWrapperStyled $backdrop={opened} />
    <PopupStyled $opened={opened}>
      {Object.entries(options).map(([chainId, chainOption]) => (
        <OptionStyled
          key={chainId}
          onClick={() => onSelect(Number(chainId))}
          $active={Number(chainId) === currentChainId}
        >
          {chainOption.iconComponent} <span>{chainOption.name}</span>
        </OptionStyled>
      ))}
    </PopupStyled>
  </>
);
