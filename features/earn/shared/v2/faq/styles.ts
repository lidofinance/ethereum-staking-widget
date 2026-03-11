import styled from 'styled-components';

export const FaqItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;

  ul {
    list-style-type: disc;
    padding-left: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;
