import { CowSwapWidgetPalette } from '@cowprotocol/widget-react';
import { arbitrum, base, linea, mainnet } from 'viem/chains';
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
};

type ChainWidgetStyle = {
  // card background, set as an inline style: the palette `paper` is parsed as a color
  card: string;
  // popups, token buttons and modals take the palette `paper`; the widget darkens it by 7% lightness for the amount inputs
  palette: CowSwapWidgetPalette;
};

type ChainPalettes = {
  light: { card: string };
  dark: { card: string; paper: string };
};

const chainStyle = ({
  light,
  dark,
}: ChainPalettes): Record<'light' | 'dark', ChainWidgetStyle> => ({
  light: { card: light.card, palette: cowSwapThemeLight },
  dark: {
    card: dark.card,
    palette: { ...cowSwapThemeDark, paper: dark.paper },
  },
});

// widget colors per network from the design (Widget UI Guide, "Swap - Networks"); the dark `paper` is picked so the
// derived input color matches the design. Linea is sampled from a mockup, TODO: exact values
export const CHAIN_WIDGET_STYLE: Record<
  number,
  Record<'light' | 'dark', ChainWidgetStyle>
> = {
  [mainnet.id]: chainStyle({
    light: { card: cowSwapThemeLight.paper },
    // inputs #17171B
    dark: { card: cowSwapThemeDark.paper, paper: '#27272F' },
  }),
  [base.id]: chainStyle({
    light: { card: 'linear-gradient(180deg, #A9C5FF 0%, #DCE8FF 100%)' },
    // inputs #172238
    dark: {
      card: 'linear-gradient(180deg, #294985 0%, #213474 100%)',
      paper: '#21314F',
    },
  }),
  [arbitrum.id]: chainStyle({
    light: { card: 'linear-gradient(180deg, #8DD6FA 0%, #D1EAF7 100%)' },
    // inputs #132536
    dark: {
      card: 'linear-gradient(180deg, #155B83 0%, #2B4A86 100%)',
      paper: '#1C3750',
    },
  }),
  [linea.id]: chainStyle({
    light: { card: 'linear-gradient(180deg, #B2DDF2 0%, #99DAF8 100%)' },
    dark: {
      card: 'linear-gradient(180deg, #436CB1 0%, #382482 100%)',
      paper: '#29254C',
    },
  }),
};
