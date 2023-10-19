import styled from 'styled-components';

const Icon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

export const LimitSafeIcon = styled(Icon)`
  background-color: var(--lido-color-success);
`;

export const LimitWarnIcon = styled(Icon)`
  background-color: var(--lido-color-warning);
`;

export const LimitReachedIcon = styled(Icon)`
  background-color: var(--lido-color-error);
`;
