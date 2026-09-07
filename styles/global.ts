import { createGlobalStyle } from 'styled-components';

import { NAV_MOBILE_HEIGHT, NAV_MOBILE_MAX_WIDTH } from './constants';

export const devicesHeaderMedia = {
  mobile: `screen and (max-width: ${NAV_MOBILE_MAX_WIDTH}px)`,
};

const GlobalStyle = createGlobalStyle`
  :root {
    --nav-mobile-height: ${NAV_MOBILE_HEIGHT}px;
    --nav-mobile-max-width: ${NAV_MOBILE_MAX_WIDTH}px;
    --nav-desktop-gutter-x: 46px;

    --header-padding-y: 18px;
    --dot-size: 6px;

    --footer-max-width: 1424px;
    --footer-desktop-padding-x: 32px;
    --footer-desktop-padding-y: 24px;

    --footer-mobile-padding-x: 20px;
    --footer-mobile-padding-y: 18px;
    --footer-mobile-margin-bottom: 60px;
    
    --custom-background-dark: #28282f;
  }

  /*
   * Theme-dependent tokens must branch in CSS, not on 'theme.name':
   * - 'data-lido-theme' is stamped by a blocking script in <head> (LidoUIHead),
   *   so CSS resolves the right value on the first paint
   * - 'theme.name' from CookieThemeProvider is 'light' until hydration, so any
   *   JS-side branch flashes the light value on slow connections
   *
   * Selector shape mirrors lido-ui's own --lido-color-* declarations
   * (element-theme-colors) — the theme has three states, not two:
   * - no attribute = follow system; the head script deletes it when no cookie
   * - 'html' (0,0,1), not ':root' (0,1,0), keeps the light base strictly
   *   weaker than [data-lido-theme='dark'] instead of tying with it
   * - unqualified [data-lido-theme='light'] also matches nested
   *   ThemeProvider wrappers, which stamp the attribute on a <div>
   * - :not([data-lido-theme='light']) inside the media query stops an
   *   explicit light cookie from losing to the system-dark rule
   */
  html,
  [data-lido-theme='light'] {
    --custom-color-controlBg: #f6f7f8;
    --custom-background-secondary: #F6F8FA;
  }
  @media (prefers-color-scheme: dark) {
    html:not([data-lido-theme='light']) {
      --custom-color-controlBg: var(--lido-color-controlBg);
      --custom-background-secondary: #2D2D35;
    }
  }
  [data-lido-theme='dark'] {
    --custom-color-controlBg: var(--lido-color-controlBg);
    --custom-background-secondary: #2D2D35;
  }
  * {
    margin: 0;
    padding: 0;
  }
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
  svg {
    box-sizing: content-box;
  }
  html,
  body {
    width: 100%;
  }
  body {
    background: var(--lido-color-background);
    color: var(--lido-color-text);
    position: relative;
    box-sizing: border-box;
    font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
    line-height: 1.5em;
    font-weight: 500;
    text-size-adjust: none;
  }
  main {
    min-height: calc(100vh - 150px);
  }
  a {
    cursor: pointer;
    text-decoration: none;
    color: var(--lido-color-primary);

    &:visited {
      color: var(--lido-color-primary);
    }

    &:hover {
      color: var(--lido-color-primaryHover);
    }

   
  }
`;

export default GlobalStyle;
