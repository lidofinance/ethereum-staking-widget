export const WINTER_STORAGE_KEY = 'lido-winter-theme';

export const LIGHTS_MODES = ['twinkle', 'chase', 'steady', 'off'] as const;
export type LightsMode = (typeof LIGHTS_MODES)[number];

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
