import { CowSwapWidgetPalette } from '@cowprotocol/widget-react';
import { arbitrum, base } from 'viem/chains';
import { themeDark, themeLight } from '@lidofinance/lido-ui';

export const cowSwapThemeDark: CowSwapWidgetPalette = {
  baseTheme: 'dark',
  primary: themeDark.colors.primary,
  background: themeDark.colors.background,
  paper: '#2D2D35',
  text: themeDark.colors.text,
  warning: themeDark.colors.warning,
  alert: themeDark.colors.warningBackground,
  danger: themeDark.colors.error,
  info: themeDark.colors.warning,
  success: themeDark.colors.success,
  // boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)', // TODO: wait fix from CowSwap team
  boxShadow: 'none',
};

export const cowSwapThemeLight: CowSwapWidgetPalette = {
  baseTheme: 'light',
  primary: themeLight.colors.primary,
  background: '#F2F2F2',
  paper: themeLight.colors.foreground,
  text: themeLight.colors.text,
  warning: themeLight.colors.warning,
  alert: themeLight.colors.warning,
  danger: themeLight.colors.error,
  info: themeLight.colors.warning,
  success: themeLight.colors.success,
  // boxShadow: '0 12px 12px 0 rgba(5, 43, 101, 0.06)', // TODO: wait fix from CowSwap team
  boxShadow: 'none',
};

const BASE_GRADIENT = 'linear-gradient(52deg, #1D1E35 0.01%, #4782FC 100%)';
const ARBITRUM_GRADIENT = 'linear-gradient(52deg, #1D1E35 0.01%, #12AAFF 100%)';

// Widget card background per network, set as an inline style of the card:
// the palette `paper` is parsed as a color and cannot hold a gradient.
// The gradients are dark, so these networks use the dark palette in any app theme
export const CHAIN_CARD_BACKGROUND: Record<number, string> = {
  [base.id]: BASE_GRADIENT,
  [arbitrum.id]: `${ARBITRUM_GRADIENT}, ${BASE_GRADIENT}`,
};

// dark palette over a network gradient: the inner blocks, popups and modals derive from `paper`,
// so it is an opaque mid navy: popups stay solid and the derived inner blocks are not near-black
export const cowSwapThemeOnGradient: CowSwapWidgetPalette = {
  ...cowSwapThemeDark,
  paper: '#33386A',
};
