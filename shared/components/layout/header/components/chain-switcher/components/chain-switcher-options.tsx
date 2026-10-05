import { FC, ReactNode } from 'react';

import {
  PopoverNoClickBackdrop,
  PopupStyled,
  type usePopupMenu,
} from 'shared/components/layout/header/components/popup';

import { ChainOptionStyled } from '../styles';

export type ChainOption = { name: string; iconComponent: ReactNode };

type PopupMenu = ReturnType<typeof usePopupMenu>;

type ChainSwitcherOptionsProps = {
  currentChainId: number;
  onSelect: (chainId: number) => void;
  opened: boolean;
  options: Record<number, ChainOption>;
  menuProps: PopupMenu['menuProps'];
  backdropProps: PopupMenu['backdropProps'];
};

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainId,
  onSelect,
  opened,
  options,
  menuProps,
  backdropProps,
}) => {
  return (
    // We need the 'PopoverNoClickBackdrop' to block any events as if you had set 'pointer-events: none' on the body
    <>
      <PopoverNoClickBackdrop {...backdropProps} />
      <PopupStyled data-testid="chainList" $opened={opened} {...menuProps}>
        {Object.entries(options).map(([chainId, chainOption]) => (
          <ChainOptionStyled
            type="button"
            data-testid={`chainRow=${chainId}`}
            key={chainId}
            onClick={() => onSelect(Number(chainId))}
            $active={Number(chainId) === currentChainId}
          >
            {chainOption.iconComponent}{' '}
            <span data-testid="chainName">{chainOption.name}</span>
          </ChainOptionStyled>
        ))}
      </PopupStyled>
    </>
  );
};
