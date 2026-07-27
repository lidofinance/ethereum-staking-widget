import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

export const Badge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 20px;
  height: 20px;
`;

export const Content = styled.div`
  width: 100%;
  height: 100%;

  > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
