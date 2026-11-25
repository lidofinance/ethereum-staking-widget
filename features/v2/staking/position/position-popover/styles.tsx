import { ActionList, ActionRow } from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

// shrinks to the popover height, so only the assets list scrolls
export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
  width: 341px;
  max-width: 100%;
  min-height: 0;
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-6);
  padding: var(--lido-app-ui-space-8);
`;

export const SummaryAmount = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--lido-app-ui-space-8);
`;

export const AssetsList = styled(ActionList)`
  min-height: 0;

  ul {
    display: flex;
    flex-direction: column;
    gap: var(--lido-app-ui-space-4);
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;

    scrollbar-width: thin;
    scrollbar-color: var(--lido-app-ui-color-border-hover) transparent;

    /* Safari before scrollbar-width support */
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
      background-color: var(--lido-app-ui-color-border-hover);
    }
  }
`;

export const AssetsOverline = styled.span`
  display: block;
  padding: var(--lido-app-ui-space-8);
`;

export const AssetRow = styled(ActionRow)`
  flex-shrink: 0;
  padding: var(--lido-app-ui-space-8);
`;
