import { CowSwapWidgetPalette } from '@cowprotocol/widget-react';
import { arbitrum, base, linea } from 'viem/chains';
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

type ChainWidgetStyle = {
  // card background, set as an inline style: the palette `paper` is parsed as a color
  card: string;
  // inner blocks, popups and modals derive from the palette `paper`
  palette: CowSwapWidgetPalette;
};

const chainStyle = (
  light: string,
  dark: string,
  darkPaper: string,
): Record<'light' | 'dark', ChainWidgetStyle> => ({
  light: { card: light, palette: cowSwapThemeLight },
  dark: { card: dark, palette: { ...cowSwapThemeDark, paper: darkPaper } },
});

// widget colors per network from the design; Linea and the dark `paper` are sampled from a mockup, TODO: exact values
export const CHAIN_WIDGET_STYLE: Record<
  number,
  Record<'light' | 'dark', ChainWidgetStyle>
> = {
  [base.id]: chainStyle(
    'linear-gradient(180deg, #A9C5FF 0%, #DCE8FF 100%)',
    'linear-gradient(180deg, #294985 0%, #213474 100%)',
    '#20304E',
  ),
  [arbitrum.id]: chainStyle(
    'linear-gradient(180deg, #8DD6FA 0%, #D1EAF7 100%)',
    'linear-gradient(180deg, #155B83 0%, #2B4A86 100%)',
    '#1F3347',
  ),
  [linea.id]: chainStyle(
    'linear-gradient(180deg, #B2DDF2 0%, #99DAF8 100%)',
    'linear-gradient(180deg, #436CB1 0%, #382482 100%)',
    '#29254C',
  ),
};
