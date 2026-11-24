import styled from 'styled-components';

export const IconBox = styled.span<{ $size: number }>`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;

  > svg {
    width: 100%;
    height: 100%;
  }
`;

export const LetterAvatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  background: var(--lido-app-ui-color-background-secondary);
  color: var(--lido-app-ui-color-text-secondary);
`;

// 12px chain badge at the bottom right, as in the design
export const ChainBadge = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--lido-app-ui-color-background-surface);
  background: var(--lido-app-ui-color-background-surface);
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
  color: var(--lido-app-ui-color-text-default);

  > svg {
    width: 100%;
    height: 100%;
  }
`;
