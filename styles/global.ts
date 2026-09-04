// Global styles live in static stylesheets now (styled-components exit):
// global.css is the former createGlobalStyle body, lido-ui-tokens.css bridges
// lido-ui's non-color theme tokens to --lido-* custom properties.
import './lido-ui-tokens.css';
import './global.css';

import { NAV_MOBILE_MAX_WIDTH } from './constants';

export const devicesHeaderMedia = {
  mobile: `screen and (max-width: ${NAV_MOBILE_MAX_WIDTH}px)`,
};

// Kept as a no-op component so providers/index.tsx (and upstream merges
// touching it) stay unchanged; importing this module loads the stylesheets.
const GlobalStyle = () => null;

export default GlobalStyle;
