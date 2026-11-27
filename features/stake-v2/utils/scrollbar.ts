import { css } from 'styled-components';

// thin scrollbar inside the scroll container, for lists in popovers
export const thinScrollbar = css`
  scrollbar-width: thin;
  scrollbar-color: var(--lido-app-ui-color-border-hover) transparent;

  /* Safari before scrollbar-width support; width: vertical, height: horizontal */
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 2px;
    background-color: var(--lido-app-ui-color-border-hover);
  }
`;
