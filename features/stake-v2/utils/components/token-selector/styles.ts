import { IconChevronDown, Popover } from '@lidofinance/lido-app-ui';
import styled, { css } from 'styled-components';

import { thinScrollbar } from '../../scrollbar';

const triggerContent = css`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--lido-app-ui-space-6);
`;

export const Trigger = styled.button`
  // removes default browser styles for button
  all: unset;
  box-sizing: border-box;
  ${triggerContent}
  padding: var(--lido-app-ui-space-4) var(--lido-app-ui-space-12)
    var(--lido-app-ui-space-4) var(--lido-app-ui-space-8);
  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-pill);
  background-color: var(--lido-app-ui-color-background-default-pressed);
  cursor: pointer;

  &:hover {
    border-color: var(--lido-app-ui-color-border-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: 2px;
  }
`;

// one option: the trigger's content, nothing to open
export const SingleToken = styled.span`
  ${triggerContent}
`;

export const Chevron = styled(IconChevronDown).attrs({
  width: 20,
  height: 20,
  'aria-hidden': 'true',
})`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--lido-app-ui-color-icons-secondary);

  transition: transform var(--lido-app-ui-duration-base)
    var(--lido-app-ui-easing-move);
  &[data-open='true'] {
    transform: rotate(180deg);
  }
`;

// the chain filter runs edge to edge, so the panel drops its padding
export const SelectorPopover = styled(Popover)`
  padding: 0;
`;

// shrinks to the popover height, so only the token list scrolls
export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 365px;
  max-width: 100%;
  max-height: 480px;
  min-height: 0;
`;

// one row, scrolls sideways when the chains do not fit
export const ChainFilter = styled.div`
  // offsetParent of the buttons, for scrolling to the selected chain
  position: relative;
  display: flex;
  flex-shrink: 0;
  gap: var(--lido-app-ui-space-8);
  padding: var(--lido-app-ui-space-12);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  background-color: var(--lido-app-ui-color-background-default);
  ${thinScrollbar}
`;

export const ChainButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: var(--lido-app-ui-space-6);
  border: 1px solid transparent;
  border-radius: var(--lido-app-ui-border-radius-sm);
  cursor: pointer;

  > svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background-color: var(--lido-app-ui-color-background-default-hover);
  }

  &[aria-pressed='true'] {
    border-color: var(--lido-app-ui-color-icons-active);
    background-color: var(--lido-app-ui-color-background-surface-active);
  }

  // inset: the scrolling row clips anything outside the button
  &:focus-visible {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: -2px;
  }
`;

export const ListCaption = styled.div`
  flex-shrink: 0;
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16) 0;
  margin-top: var(--lido-app-ui-space-12);
`;

export const OptionList = styled.div`
  // offsetParent of the options, for scrolling to the selected one
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
  min-height: 0;
  padding: var(--lido-app-ui-space-12);
  overflow-y: auto;
  overscroll-behavior: contain;
  ${thinScrollbar}
`;

export const Option = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--lido-app-ui-space-12);
  width: 100%;
  padding: var(--lido-app-ui-space-16);
  border: 1px solid transparent;
  border-radius: var(--lido-app-ui-border-radius-md);
  cursor: pointer;

  &:hover {
    background-color: var(--lido-app-ui-color-background-default-hover);
  }

  &[aria-selected='true'] {
    border-color: var(--lido-app-ui-color-border-active);
    background-color: var(--lido-app-ui-color-background-surface-active);

    &:hover {
      background-color: var(
        --lido-app-ui-color-background-surface-active-hover
      );
    }
  }

  &:focus-visible {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: -2px;
  }
`;

export const OptionColumn = styled.span`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  min-width: 0;
  white-space: nowrap;

  &[data-align='end'] {
    align-items: flex-end;
  }
`;
