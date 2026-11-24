import styled from 'styled-components';

export const UpdateRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);
`;

export const RefreshButton = styled.button<{ $spinning: boolean }>`
  display: inline-flex;
  padding: 0;
  border: 0;
  background: none;
  color: var(--lido-app-ui-color-icons-secondary);
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    animation: ${({ $spinning }) =>
      $spinning ? 'portfolio-spin 1s linear infinite' : 'none'};
  }

  @keyframes portfolio-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
