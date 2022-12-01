import styled from 'styled-components';

export const LeftOptionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const TitleStyle = styled.span`
  font-weight: bold;
  line-height: 24px;
  font-size: 14px;
  margin-right: 64px;
`;

export const ItemWrapperStyle = styled.div`
  margin-right: 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 24px;
  }
`;

export const CheckBoxesWrapper = styled.div`
  display: flex;
`;
