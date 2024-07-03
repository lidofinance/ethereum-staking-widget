import styled from 'styled-components';
import { InlineLoader, ThemeName } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';

import Lido from 'assets/icons/lido.svg';
import ExternalLink from 'assets/icons/external-link-icon.svg';

// ICONS

export const LidoIcon = styled.img.attrs({
  src: Lido,
  alt: '',
})`
  display: block;
`;

// LIDO OPTION

export const LidoOptionContainer = styled.div`
  width: 100%;
  min-height: 82px;
  // we need to update lido ui
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35'};
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;

  padding: 16px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;

  margin-bottom: 16px;

  color: var(--lido-color-text);
  font-weight: 400;
  font-size: 14px;
`;

export const LidoOptionValue = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: auto;
`;

export const LidoOptionInlineLoader = styled(InlineLoader)`
  display: block;
  width: 100px;
`;

export const FormatTokenStyled = styled(FormatToken)`
  font-size: 14px;
  line-height: 24px;
  font-weight: 700;
  color: var(--lido-color-text);
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
  gap: 4px;
  // we need to update lido ui
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35'};

  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  border: 1px solid var(--lido-color-border);
  position: relative;
  cursor: pointer;

  border-color: ${({ $active }) =>
    $active ? '#00A3FF' : 'var(--lido-color-border)'};
  padding: 16px 20px;
  font-size: 12px;
  font-family: inherit;
  color: var(--lido-color-text);

  /* safari workaround */
  &:focus {
    outline: none;
    ::before {
      content: '';
      pointer-events: none;
      position: absolute;
      top: -2px;
      right: -2px;
      bottom: -2px;
      left: -2px;

      border: 1px solid var(--lido-color-borderActive);
      border-radius: ${({ theme }) => theme.borderRadiusesMap.lg + 1}px;
    }
  }

  & > :first-child {
    margin-bottom: 12px;
  }
`;

export const OptionsPickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  gap: 8px;
  line-height: 20px;
  text-align: right;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    text-align: center;
  }
`;

export const OptionsPickerLabel = styled.label`
  color: var(--color-text);
  font-weight: 700;
  text-align: left;
  ${({ theme }) => theme.mediaQueries.md} {
    text-align: center;
  }
`;
export const OptionsPickerSubLabel = styled.label`
  color: var(--lido-color-textSecondary);
  line-height: 20px;
  text-align: left;
  ${({ theme }) => theme.mediaQueries.md} {
    text-align: center;
  }
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
    &:first-child {
      margin-left: 0px;
    }
    filter: ${({ theme }) =>
      theme.name === ThemeName.light
        ? 'drop-shadow(0px 0px 1px rgba(246, 248, 250, 255))'
        : 'unset'};
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
  // we need to update lido ui
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35'};
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: 16px 20px;

  display: grid;
  gap: 5px 16px;
  grid-template: 1fr 1fr / 44px max-content;

  & > svg,
  & > img {
    grid-row: 1 / 3;
    grid-column: 1 / 1;
    align-self: center;
    width: 44px;
    filter: ${({ theme }) =>
      theme.name === ThemeName.light
        ? 'drop-shadow(0px 0px 1px rgba(246, 248, 250, 255))'
        : 'unset'};
  }
`;

export const DexOptionLoader = styled(InlineLoader)`
  display: block;
  width: 100%;
  min-height: 82px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
`;

export const DexOptionBlockTitle = styled.span`
  grid-row: 1;
  grid-column: 2;
  color: var(--lido-color-text);
  font-weight: 400;
  font-size: 14px;
`;

export const DexOptionBlockLink = styled.a`
  grid-row: 2;
  grid-column: 2;
  &::after {
    content: ' ';
    display: inline-block;
    background: url(${ExternalLink}) center / contain no-repeat;
    width: 12px;
    height: 12px;
    margin-left: 8px;
    margin-bottom: -1px;
  }
`;

export const DexOptionAmount = styled.span`
  grid-row: 1 / 3;
  grid-column: 3;
  width: 100%;
  justify-self: end;
  align-self: center;
  text-align: end;

  color: var(--lido-color-text);
  font-weight: 700;
  font-size: 14px;
`;

export const InlineLoaderSmall = styled(InlineLoader)`
  max-width: 74px;
`;

export const DexWarning = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  font-weight: 400;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  // we need to update lido ui
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35'};
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;

  svg {
    display: block;
    margin-right: ${({ theme }) => theme.spaceMap.xs}px;
  }
`;
