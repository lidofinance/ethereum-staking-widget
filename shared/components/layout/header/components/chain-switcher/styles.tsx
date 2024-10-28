import styled, { css } from 'styled-components';

type SelectProps = {
  $disabled: boolean;
};

export const SelectStyled = styled.div<SelectProps>`
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;

  position: relative;
  overflow: ${({ $disabled }) => ($disabled ? 'hidden' : 'visible')};
  box-sizing: border-box;

  width: ${({ $disabled }) => ($disabled ? '44px' : '68px')};
  height: 44px;
  margin-right: 12px;
  padding: 9px 8px;

  font-weight: 400;
  font-size: 14px;
  color: var(--lido-color-text);

  border-radius: 10px;
  transition: border-color 100ms;

  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};

  background: var(--lido-color-controlBg);

  &:not(:disabled):hover {
    ${({ theme, $disabled }) =>
      theme.name === 'dark'
        ? css`
            background: ${!$disabled && '#34343D'};
          `
        : css`
            background: ${!$disabled && '#000A3D08'};
          `}
  }
`;

export const SelectIconStyle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  justify-self: stretch;
`;

type SelectArrowProps = {
  $opened: boolean;
};

export const SelectArrowStyle = styled.div<SelectArrowProps>`
  border: 3px solid currentColor;
  border-bottom-width: 0;
  border-left-color: transparent;
  border-right-color: transparent;

  color: var(--lido-color-text);
  margin-right: 6px;

  transform: rotate(${({ $opened }) => ($opened ? 180 : 0)}deg);
  transition: transform ${({ theme }) => theme.duration.norm} ease;
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

export const PopupMenuStyled = styled.div<PopupMenuProps>`
  min-width: 146px;
  z-index: 200;

  position: absolute;
  top: 48px;

  overflow: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  margin: 0;
  padding: 0;

  background: var(--lido-color-foreground);
  color: var(--lido-color-text);
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

export const PopupMenuOptionStyled = styled.div<PopupMenuOptionProps>`
  display: flex;
  align-items: center;

  width: 100%;
  height: 44px;
  
  padding: 0 15px;
  margin: 0;
  box-sizing: border-box;

  text-align: left;
  color: var(--lido-color-text);
  
  transition: opacity 100ms;

  cursor: pointer;
  
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
`;
