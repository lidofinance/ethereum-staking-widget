import styled from 'styled-components';

// answers are plain markup; give it the app-ui type scale
export const FaqAnswer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);

  p,
  ul,
  h4 {
    margin: 0;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: var(--lido-app-ui-space-8);
    padding-left: var(--lido-app-ui-space-20);
  }

  ul ul {
    margin-top: var(--lido-app-ui-space-8);
  }

  h4,
  strong {
    font-weight: var(--lido-app-ui-font-weight-semibold);
    color: var(--lido-app-ui-color-text-default);
  }

  a {
    color: var(--lido-app-ui-color-text-active);
  }
`;
