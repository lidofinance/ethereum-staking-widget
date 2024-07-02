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

export const OptionAmountRow = styled.div`
  display: flex;
  align-items: center;
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
  position: relative;
  cursor: pointer;
  // we need to update lido ui
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35'};

  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  border: ${({ $active }) => ($active ? '2' : '1')}px solid
    var(--lido-color-border);
  border-color: ${({ $active }) =>
    $active ? '#00A3FF' : 'var(--lido-color-border)'};
  padding: ${({ $active }) => ($active ? '15px 19px' : '16px 20px')};

  font-size: 12px;
  font-family: inherit;
  color: var(--lido-color-text);

  /* safari outline workaround */
  ::before {
    content: '';
    pointer-events: none;
    position: absolute;
    opacity: 0;
    top: -3px;
    right: -3px;
    bottom: -3px;
    left: -3px;
  }

  &:focus {
    outline: none;
    ::before {
      opacity: 1;
      // to match with border change speed
      transition: opacity 0s linear 0.1s;
      border: 1px solid var(--lido-color-borderActive);
      border-radius: ${({ theme }) => theme.borderRadiusesMap.lg + 1}px;
    }
  }
`;

export const OptionsPickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  gap: 8px;
  line-height: 20px;
  font-weight: 400;
  text-align: right;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    text-align: center;
  }

  &:first-child {
    margin-bottom: 12px;
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
    border: 1px solid;
    border-color: ${({ theme }) =>
      theme.name === ThemeName.light
        ? 'var(--lido-color-backgroundSecondary)'
        : '#F6F8FA'};
    background-color: ${({ theme }) =>
      theme.name === ThemeName.light
        ? 'var(--lido-color-backgroundSecondary)'
        : '#F6F8FA'};
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

export const DexOptionsContainer = styled.div<{ $maxElements: number }>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  & > div,
  span {
    display: none;
    ${({ theme }) => theme.mediaQueries.md} {
      display: grid;
    }

    &:nth-of-type(-n + ${({ $maxElements }) => $maxElements}) {
      display: grid;
    }
  }
`;

export const DexOptionsShowMore = styled.button`
  display: flex;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }

  padding: 2px 16px;
  margin-top: 8px;
  flex: 0 1;

  align-self: center;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;

  background: none;
  outline: none;
  border: none;
  color: var(--lido-color-primary);
  line-height: 20px;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
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

const DexOptionsCheckMark = (props: React.ComponentProps<'svg'>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.2929 14.7071C11.6834 15.0976 12.3166 15.0976 12.7071 14.7071L16.7071 10.7071C17.0976 10.3166 17.0976 9.68342 16.7071 9.29289C16.3166 8.90237 15.6834 8.90237 15.2929 9.29289L12 12.5858L8.70711 9.29289C8.31658 8.90237 7.68342 8.90237 7.29289 9.29289C6.90237 9.68342 6.90237 10.3166 7.29289 10.7071L11.2929 14.7071Z"
      fill="#00A3FF"
    />
  </svg>
);

export const DexOptionsCheckMarkIcon = styled(DexOptionsCheckMark)<{
  $active?: boolean;
}>`
  transition: transform 0.3s ease-in-out;
  transform: rotateY(180deg);
  transform: ${({ $active }) =>
    $active ? 'rotateZ(180deg)' : 'rotateZ(0deg)'};
`;
