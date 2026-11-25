import styled from 'styled-components';

export const IconBox = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: 32px;
  height: 32px;

  > svg {
    width: 100%;
    height: 100%;
  }
`;

// 12px on the default 32px icon
export const ChainBadge = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-flex;
  width: 37.5%;
  height: 37.5%;

  > svg {
    width: 100%;
    height: 100%;
  }
`;
