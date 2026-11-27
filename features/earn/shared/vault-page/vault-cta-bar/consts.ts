export const BAR_BOTTOM = 20;
export const BAR_HEIGHT = 52;
export const FAB_SIZE = 36;

// Lifts the FAQ button to the middle of the bar.
// The library puts the button one viewport inset above the bottom.
export const CTA_BAR_FAB_RAISE = `calc(${BAR_BOTTOM + (BAR_HEIGHT - FAB_SIZE) / 2}px - var(--lido-app-ui-viewport-inset))`;
