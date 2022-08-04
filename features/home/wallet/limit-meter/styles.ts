import styled from 'styled-components';

export const LevelText = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const GreenSpan = styled.span`
  color: ${(props) => props.theme.colors.success};
`;

export const YellowSpan = styled.span`
  color: ${(props) => props.theme.colors.warning};
`;

export const RedSpan = styled.span`
  color: ${(props) => props.theme.colors.error};
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
  background: ${(props) => props.theme.colors.success};
  opacity: 1;
`;

export const YellowBar = styled(EmptyBar)`
  background: ${(props) => props.theme.colors.warning};
  opacity: 1;
`;

export const RedBar = styled(EmptyBar)`
  background: ${(props) => props.theme.colors.error};
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
