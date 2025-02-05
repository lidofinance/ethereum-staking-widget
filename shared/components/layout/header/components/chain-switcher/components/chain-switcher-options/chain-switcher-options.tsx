import { FC, ReactNode, useRef } from 'react';

import { useClickOutside } from '../../hooks/use-click-outside';

import { PopoverWrapperStyled, PopupStyled, OptionStyled } from './styles';

export type ChainOption = { name: string; iconComponent: ReactNode };

interface ChainSwitcherOptionsProps {
  currentChainId: number;
  onSelect: (chainId: number) => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  options: Record<number, ChainOption>;
}

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainId,
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
};
