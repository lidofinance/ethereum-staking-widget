import { createGlobalStyle } from 'styled-components';

import { NAV_MOBILE_HEIGHT, NAV_MOBILE_MAX_WIDTH } from './constants';
import { ThemeName } from '@lidofinance/lido-ui';

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
    
    --custom-background-secondary: ${({ theme }) => (theme.name === ThemeName.light ? '#F6F8FA' : '#2D2D35')} ;
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
