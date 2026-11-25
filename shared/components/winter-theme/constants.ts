// TEMPORARY: keeps the theme on for review on preview stands. They read the
// manifest from GitHub main, where holidayDecorEnabled is off.
// Remove before merging so the manifest flag alone controls the theme.
export const WINTER_THEME_FORCED = true;

export const WINTER_STORAGE_KEY = 'lido-winter-theme';

// Elements opt in to a snow drift with data-snow-surface="card" | "block" | "button"
export const SNOW_SURFACE_ATTR = 'data-snow-surface';
// On a list (FAQ): every item of its content gets a drift of this kind
export const SNOW_ITEMS_ATTR = 'data-snow-items';
// No drifts inside (collapsible content: hidden cards would carry snow)
export const SNOW_SKIP_ATTR = 'data-snow-skip';

// The stake cards Lido-man and the icicles hang on. The wallet card sits
// above the form when shown, so Lido-man peeks over whichever is on top.
export const WINTER_ANCHOR_ATTR = 'data-winter-anchor';
export const ANCHOR_TOP = 'stake-top';
export const ANCHOR_FORM = 'stake-form';

// Known on the server too: decides the space reserved for the theme,
// so the page does not jump when it mounts
export const isWinterThemeRequested = (flag: boolean | undefined): boolean =>
  !!flag || WINTER_THEME_FORCED;

type WinterThemeContextInput = {
  requested: boolean;
  isIframe: boolean;
  appFlag: string | undefined;
};

// The theme itself: never inside an iframe (Safe) or Ledger Live
export const isWinterThemeAllowed = ({
  requested,
  isIframe,
  appFlag,
}: WinterThemeContextInput): boolean =>
  requested && !isIframe && appFlag !== 'ledger-live';

export const LIDO_MAN_PHRASES = [
  'GM, and Happy New Year!',
  'Stake ETH, not snowballs.',
  'Ho-ho-HODL!',
] as const;

// Local midnight of the next New Year
export const getNextNewYear = (now: Date) =>
  new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);

// The countdown is shown in December and turns into a greeting
// for the first days of January
export const GREETING_DAYS = 7;
