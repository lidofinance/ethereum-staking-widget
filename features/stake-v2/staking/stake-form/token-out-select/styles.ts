import styled from 'styled-components';

export const TokenOutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
  width: 352px;
  max-width: 100%;
  padding: var(--lido-app-ui-space-8);
`;

// second line of the description, set apart from the token blurb
export const RateLine = styled.span`
  display: block;
  margin-top: var(--lido-app-ui-space-8);
`;
