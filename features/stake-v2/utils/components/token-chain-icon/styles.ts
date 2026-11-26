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

// 12px at every icon size, as in the design
export const ChainBadge = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-flex;
  width: 12px;
  height: 12px;

  > svg {
    width: 100%;
    height: 100%;
  }
`;
