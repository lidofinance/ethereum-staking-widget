import styled from 'styled-components';

export const InfoBoxStyled = styled.div<{
  $variant?: 'error' | 'warning';
}>`
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  background-color: ${({ $variant }) =>
    $variant === 'error'
      ? 'rgba(225, 77, 77, 0.5)'
      : 'var(--lido-color-warningBackground)'};
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  font-size: 12px;
  line-height: 20px;
  color: var(--lido-color-text);
`;
