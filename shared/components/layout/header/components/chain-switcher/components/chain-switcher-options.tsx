import { FC, ReactNode } from 'react';

import {
  PopoverNoClickBackdrop,
  PopupStyled,
  OptionStyled,
} from 'shared/components/layout/header/components/popup';

export type ChainOption = { name: string; iconComponent: ReactNode };

type ChainSwitcherOptionsProps = {
  currentChainId: number;
  onSelect: (chainId: number) => void;
  opened: boolean;
  options: Record<number, ChainOption>;
};

export const ChainSwitcherOptions: FC<ChainSwitcherOptionsProps> = ({
  currentChainId,
  onSelect,
  opened,
  options,
}) => {
  return (
    // We need the 'PopoverNoClickBackdrop' to block any events as if you had set 'pointer-events: none' on the body
    <>
      <PopoverNoClickBackdrop $backdrop={opened} />
      <PopupStyled data-testid="chainList" $opened={opened}>
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
