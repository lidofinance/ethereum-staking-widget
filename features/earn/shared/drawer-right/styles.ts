import styled from 'styled-components';

export const DrawerDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
`;

export const DrawerRightText = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
  color: var(--lido-color-textSecondary);
`;
