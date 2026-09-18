import { FC, ReactNode, useRef } from 'react';

import {
  PopoverNoClickBackdrop,
  PopupStyled,
  OptionStyled,
  useClickOutside,
} from 'shared/components/layout/header/components/popup';

export type ChainOption = { name: string; iconComponent: ReactNode };

type ChainSwitcherOptionsProps = {
  currentChainId: number;
  onSelect: (chainId: number) => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  options: Record<number, ChainOption>;
};

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
    // We need the 'PopoverNoClickBackdrop' to block any events as if you had set 'pointer-events: none' on the body
    <>
      <PopoverNoClickBackdrop $backdrop={opened} />
      <PopupStyled data-testid="chainList" $opened={opened} ref={popupRef}>
        {Object.entries(options).map(([chainId, chainOption]) => (
          <OptionStyled
            data-testid={`chainRow=${chainId}`}
            key={chainId}
            onClick={() => onSelect(Number(chainId))}
            $active={Number(chainId) === currentChainId}
          >
            {chainOption.iconComponent}{' '}
            <span data-testid="chainName">{chainOption.name}</span>
          </OptionStyled>
        ))}
      </PopupStyled>
    </>
  );
};
