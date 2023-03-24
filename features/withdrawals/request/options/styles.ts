import styled from 'styled-components';
import { Chip } from '@lidofinance/lido-ui';
import Lido from 'assets/icons/lido.svg';
import Oneinch from 'assets/icons/oneinch-circle.svg';

export const OptionsBlockStyled = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const OptionsTitleStyled = styled.span`
  line-height: 20px;
  font-size: 12px;
`;

export const OptionStyled = styled.div<{ $selected?: boolean }>`
  padding: ${({ theme }) => theme.spaceMap.md}px
    ${({ theme }) => theme.spaceMap.lg}px;
  background-color: var(--lido-color-backgroundSecondary);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  display: flex;
  position: relative;
  // TODO uncomment after add integration
  /* cursor: pointer; */

  &:first-of-type {
    margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    pointer-events: none;
    // TODO uncomment after add integration
    /* border: ${({ $selected }) =>
      $selected ? '2px solid #00A3FF' : 'none'}; */
    background: var(--color-shadow);
    transition: opacity 0.15s ease-out;
  }
`;

export const OptionInfoStyled = styled.div`
  margin-left: ${({ theme }) => theme.spaceMap.md}px;
`;

export const OptionTitleStyled = styled.div`
  font-size: 14px;
  font-weight: 700;
  line-height: 24px;
  color: var(--lido-color-text);
`;

export const OptionDescStyled = styled.div`
  font-size: 12px;
  line-height: 20px;
`;

export const OptionDescRangeStyled = styled.span`
  color: var(--lido-color-text);
`;

export const OptionAmountStyled = styled.span`
  margin-left: auto;
`;

export const LidoIcon = styled.img.attrs({
  src: Lido,
  alt: '',
})`
  display: block;
  width: 44px;
  height: 44px;
`;

export const OneinchIcon = styled.img.attrs({
  src: Oneinch,
  alt: '',
})`
  display: block;
  width: 44px;
  height: 44px;
`;

export const PrimaryLableStyled = styled(Chip)`
  position: absolute;
  left: 0;
  top: -12px;
  font-size: 12px;
  line-height: 20px;
  padding: 2px 12px;
`;

export const OptionAmountWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

export const OptionAmountRow = styled.div`
  display: flex;
  align-items: center;
`;
