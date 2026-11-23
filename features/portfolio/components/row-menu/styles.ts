import styled, { css } from 'styled-components';

import { LocalLink } from 'shared/components/local-link';

export const MoreButton = styled.button`
  display: inline-flex;
  padding: 2px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--lido-app-ui-color-icons-default);
  cursor: pointer;

  &:hover,
  &[aria-expanded='true'] {
    background: var(--lido-app-ui-color-background-secondary);
  }
`;

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 132px;
  padding: var(--lido-app-ui-space-4);
`;

const itemStyles = css`
  display: block;
  width: 100%;
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-12);
  border: 0;
  border-radius: var(--lido-app-ui-border-radius-sm);
  background: none;
  color: var(--lido-app-ui-color-text-default);
  font-family: var(--lido-app-ui-font-family);
  font-size: 14px;
  line-height: 24px;
  font-weight: 400;
  letter-spacing: -0.14px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--lido-app-ui-color-background-default);
  }
`;

export const MenuLink = styled(LocalLink)`
  ${itemStyles}

  // beats the global link colours of lido-ui in every state
  &&,
  &&:link,
  &&:visited,
  &&:hover {
    color: var(--lido-app-ui-color-text-default);
  }
`;

export const MenuButton = styled.button`
  ${itemStyles}
`;
