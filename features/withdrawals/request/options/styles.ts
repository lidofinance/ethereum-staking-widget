import styled from 'styled-components';
import { Chip, InlineLoader } from '@lidofinance/lido-ui';
import Lido from 'assets/icons/lido.svg';
import Oneinch from 'assets/icons/oneinch-circle.svg';
import Paraswao from 'assets/icons/paraswap-circle.svg';
import Cowswap from 'assets/icons/cowswap-circle.svg';

// ICONS

export const LidoIcon = styled.img.attrs({
  src: Lido,
  alt: '',
})`
  display: block;
`;

export const OneInchIcon = styled.img.attrs({
  src: Oneinch,
  alt: '1inch',
})`
  display: block;
`;

export const ParaSwapIcon = styled.img.attrs({
  src: Paraswao,
  alt: 'paraswap',
})`
  display: block;
`;

export const CowSwapIcon = styled.img.attrs({
  src: Cowswap,
  alt: 'cowswap',
})`
  display: block;
`;

export const PrimaryLableStyled = styled(Chip)`
  position: absolute;
  left: 0;
  top: -12px;
  font-size: 12px;
  line-height: 20px;
  padding: 2px 12px;
`;

export const OptionAmountRow = styled.div`
  display: flex;
  align-items: center;
`;

// OPTIONS PICKER

export const OptionsPickerContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const OptionsPickerButton = styled.button<{ $active?: boolean }>`
  flex: 1 0;
  display: flex;
  flex-direction: column;
  background-color: var(--lido-color-backgroundSecondary);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  border: 1px solid var(--lido-color-border);
  cursor: pointer;
  outline: ${({ $active }) => ($active ? '1px solid #00A3FF' : 'none')};
  border-color: ${({ $active }) =>
    $active ? '#00A3FF' : 'var(--lido-color-border)'};
  padding: 16px 20px;
  font-size: 12px;
  color: var(--lido-color-text);

  & > :first-child {
    margin-bottom: 12px;
  }
`;

export const OptionsPickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const OptionsPickerLabel = styled.label`
  color: var(--color-text);
  font-weight: 700;
`;
export const OptionsPickerSubLabel = styled.label`
  color: var(--lido-color-textSecondary);
`;

export const OptionsPickerIcons = styled.div`
  display: flex;
  justify-content: end;

  & > * {
    box-sizing: content-box;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    border: 1px solid var(--lido-color-backgroundSecondary);
    background-color: var(--lido-color-backgroundSecondary);
    margin: -1px 0 -1px -8px;
  }
`;

// DEX OPTIONS

export const DexOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DexOptionStyled = styled.div<{ $loading?: boolean }>`
  width: 100%;
  min-height: 82px;
  background-color: var(--lido-color-backgroundSecondary);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: 16px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const DexOptionBlock = styled.div`
  display: grid;
  gap: 4px 16px;
  grid-template: 1fr 1fr / 44px 1fr;

  & > svg,
  & > img {
    grid-row: 1 / 3;
    grid-column: 1 / 1;
  }
`;

export const DexOptionBlockTitle = styled.span`
  grid-row: 1;
  grid-column: 2;
`;

export const DexOptionBlockLink = styled.a`
  grid-row: 2;
  grid-column: 2;
`;

export const DexOptionAmount = styled.span`
  color: var(--lido-color-text);
  font-weight: 700;
  font-size: 14px;
`;

export const InlineLoaderSmall = styled(InlineLoader)`
  max-width: 74px;
`;
