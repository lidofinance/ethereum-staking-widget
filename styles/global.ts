import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
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
      color: var(--lido-color-primaryVisited);
    }

    &:hover {
      color: var(--lido-color-primaryHover);
    }

   
  }
`;

export default GlobalStyle;
