import styled from 'styled-components';

export const LevelText = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const GreenSpan = styled.span`
  color: var(--lido-color-success);
`;

export const YellowSpan = styled.span`
  color: var(--lido-color-warning);
`;

export const RedSpan = styled.span`
  color: var(--lido-color-error);
`;

export const EmptyBar = styled.div`
  display: inline-block;
  background: #fff;
  opacity: 0.1;
  border-radius: 8px;
  height: 4px;
  width: 100%;
`;

export const GreenBar = styled(EmptyBar)`
  background: var(--lido-color-success);
  opacity: 1;
`;

export const YellowBar = styled(EmptyBar)`
  background: var(--lido-color-warning);
  opacity: 1;
`;

export const RedBar = styled(EmptyBar)`
  background: var(--lido-color-error);
  opacity: 1;
`;

export const Bars = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 3px;
  margin-top: 10px;
`;

export const LevelContainer = styled.div`
  margin-top: 16px;
  margin-bottom: 4px;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  line-height: 0;
  :hover {
    cursor: pointer;
  }
`;
