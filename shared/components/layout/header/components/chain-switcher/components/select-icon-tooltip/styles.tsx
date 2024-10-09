import styled, { css } from 'styled-components';

interface TooltipProps {
  $showArrow?: boolean;
}

export const SelectIconTooltipWrapper = styled.div`
  position: absolute;
  left: 0;
  top: calc(100% + 16px);
  width: 244px;
  z-index: 5;
`;

export const SelectIconTooltipContent = styled.div<TooltipProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ theme }) => theme.spaceMap.md}px
    ${({ theme }) => theme.spaceMap.md}px;
  background-color: var(--lido-color-accent);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.sm}px;

  ${({ $showArrow }) =>
    $showArrow &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: -6px;
        left: 27px;
        display: block;
        width: 12px;
        height: 12px;
        transform: rotate(45deg);
        flex-shrink: 0;
        border-radius: 2px 0 0 0;
        background: var(--lido-color-accent);
      }
    `}
`;
