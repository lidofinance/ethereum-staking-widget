import styled, { css } from 'styled-components';

export const ChainSwitcherWrapperStyled = styled.div`
  position: relative;
`;

export const ChainSwitcherStyled = styled.div<{
  $disabled: boolean;
  $showArrow: boolean;
}>`
  z-index: 202;

  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;

  position: relative;
  overflow: ${({ $disabled }) => ($disabled ? 'hidden' : 'visible')};
  box-sizing: border-box;

  width: ${({ $showArrow }) => ($showArrow ? '68px' : '44px')};
  height: 44px;
  margin-right: 12px;
  padding: 9px 8px;

  font-weight: 400;
  font-size: 14px;
  color: var(--lido-color-text);

  border-radius: 10px;
  transition: border-color 100ms;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  // Fix the highlight by click
  -webkit-tap-highlight-color: transparent;
  outline: none;

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

export const IconStyle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  justify-self: stretch;
`;

export const ArrowStyle = styled.div<{ $opened: boolean }>`
  border: 3px solid #7a8aa0;
  border-bottom-width: 0;
  border-left-color: transparent;
  border-right-color: transparent;

  margin-right: 6px;

  transform: rotate(${({ $opened }) => ($opened ? 180 : 0)}deg);
  transition: transform ${({ theme }) => theme.duration.norm} ease;
`;
