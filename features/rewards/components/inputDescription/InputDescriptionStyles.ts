import styled from 'styled-components';

export const WrapperStyle = styled.div`
  padding: ${({ theme }) => theme.spaceMap.sm}px;
  border-radius: ${({ theme }) => theme.spaceMap.sm}px;
  color: #ffac2f;
  background-color: rgb(255, 172, 47, 0.1);
  text-align: center;
  margin-top: 16px;
`;
