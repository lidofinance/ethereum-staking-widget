import styled from 'styled-components';
import { InlineLoader, Question } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';

import Lido from 'assets/icons/lido.svg';

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

export const InlineQuestion = styled(Question)`
  width: 20px;
  height: 20px;
  vertical-align: top;
`;

// LIDO OPTION

export const InlineLoaderSmall = styled(InlineLoader)`
  max-width: 50px;
`;

export const LidoOptionContainer = styled.div`
  width: 100%;
  min-height: 82px;

  background-color: var(--custom-background-secondary);
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

  background-color: var(--custom-background-secondary);

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
    border-color: var(--custom-background-secondary);
    background-color: var(--custom-background-secondary);
    margin: -1px 0 -1px -8px;
    &:first-child {
      margin-left: 0px;
    }
  }
`;
