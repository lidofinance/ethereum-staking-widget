import styled, { css } from 'styled-components';
import { POPUP_MENU_Z_INDEX } from '../popup';

export const ChainSwitcherWrapperStyled = styled.div`
  position: relative;
`;

export const ChainSwitcherStyled = styled.div<{
  $disabled: boolean;
  $loading?: boolean;
}>`
  z-index: ${POPUP_MENU_Z_INDEX + 1};

  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;

  position: relative;
  overflow: ${({ $disabled }) => ($disabled ? 'hidden' : 'visible')};
  box-sizing: border-box;

  width: ${({ $disabled, $loading }) => ($disabled && !$loading ? '44px' : '68px')};
  height: 44px;
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
    background: ${({ theme, $disabled }) => !$disabled && (theme.name === 'dark' ? '#34343D' : '#000A3D08')};
  }
`;

export const IconStyle = styled.span<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  justify-self: stretch;

  ${({ $loading }) =>
    $loading &&
    css`
      opacity: 0.5;
    `}
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
