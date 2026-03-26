import styled from 'styled-components';

export const FallbackContainer = styled.div`
  display: flex;

  height: 200px;
  padding: 0 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  align-self: stretch;

  border-radius: 10px;
  background-color: var(--custom-background-secondary);

  h2 {
    color: var(--lido-color-text);
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: var(--lido-color-textSecondary);
    font-size: 12px;
    font-weight: 400;
    text-align: center;
  }
`;
