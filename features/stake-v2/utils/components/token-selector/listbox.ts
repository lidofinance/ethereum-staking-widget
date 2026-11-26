import type { KeyboardEvent } from 'react';

export const OPTION_SELECTOR = '[role="option"]';

// scrolls `container` so `item` sits in its middle; `container` must be the
// offsetParent of `item`. No scrollIntoView: it could scroll the page too
export const centerInView = (
  container: HTMLElement | null,
  item: HTMLElement | null | undefined,
) => {
  if (!container || !item) return;
  container.scrollTop =
    item.offsetTop - (container.clientHeight - item.offsetHeight) / 2;
  container.scrollLeft =
    item.offsetLeft - (container.clientWidth - item.offsetWidth) / 2;
};

/**
 * onKeyDown of a role="listbox": arrow keys, Home and End walk its options.
 * Give the selected option tabIndex 0 and the rest -1, so Tab enters and
 * leaves the list as one stop.
 */
export const moveListboxFocus = (event: KeyboardEvent<HTMLElement>) => {
  const options = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(OPTION_SELECTOR),
  );
  const index = options.indexOf(document.activeElement as HTMLElement);
  const last = options.length - 1;
  const next = {
    ArrowDown: Math.min(index + 1, last),
    ArrowUp: Math.max(index - 1, 0),
    Home: 0,
    End: last,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  options[next]?.focus();
};
