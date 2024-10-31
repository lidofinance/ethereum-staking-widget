import styled, { css } from 'styled-components';

export const PopoverWrapperStyled = styled.div<{ $backdrop: boolean }>`
  position: fixed;
  z-index: 200;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  height: ${({ $backdrop }) => ($backdrop ? '100%' : '0px')};
`;

type PopupMenuProps = {
  $opened: boolean;
};

const visibleCSS = css`
  opacity: 1;

  &[data-placement] {
    transform: translate(0, 0);
  }
`;

const hiddenCSS = css`
  opacity: 0;

  &[data-placement^='top'] {
    transform: translateY(6px);
  }
  &[data-placement^='right'] {
    transform: translateX(-6px);
  }
  &[data-placement^='bottom'] {
    transform: translateY(-6px);
  }
  &[data-placement^='left'] {
    transform: translateX(6px);
  }
`;

export const PopupStyled = styled.div<PopupMenuProps>`
  min-width: 115px;
  z-index: 201;

  position: absolute;
  top: 48px;

  overflow: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  margin: 0;
  padding: 0;

  background: var(--lido-color-foreground);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 1.5em;
  font-weight: 400;

  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  box-shadow: ${({ theme }) => theme.boxShadows.xs}
    var(--lido-color-shadowLight);

  transition: opacity 150ms ease;
  transition-property: opacity, transform;

  ${({ $opened }) => ($opened ? visibleCSS : hiddenCSS)};
`;

type PopupMenuOptionProps = {
  $active: boolean;
};

export const OptionStyled = styled.div<PopupMenuOptionProps>`
  display: flex;
  align-items: center;

  width: 100%;
  height: 44px;

  padding: 0 8px;
  margin: 0;
  box-sizing: border-box;

  text-align: left;
  color: var(--lido-color-text);
  transition: opacity 100ms;
  cursor: pointer;

  // Fix the highlight by click
  -webkit-tap-highlight-color: transparent;
  outline: none;

  // Backgrounds
  background: var(--lido-color-controlBg);

  ${({ theme, $active }) =>
    theme.name === 'dark'
      ? css`
          background: ${$active && '#34343D'};
        `
      : css`
          background: ${$active && '#000A3D08'};
        `}

  &:not(:disabled):hover {
    ${({ theme }) =>
      theme.name === 'dark'
        ? css`
            background: #34343d;
          `
        : css`
            background: #000a3d08;
          `}
  }

  // Option.Text
  & > span {
    margin-left: 8px;

    font-weight: 400;
    font-size: 12px;
    color: #7a8aa0;
  }
`;
