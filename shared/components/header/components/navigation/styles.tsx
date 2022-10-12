import styled, { css } from 'styled-components';

export const desktopCss = css`
  margin: 0 46px;
  display: flex;

  svg {
    margin-right: 10px;
  }
`;

const mobileCss = css`
  margin: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: var(--lido-color-foreground);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--lido-color-border);

  svg {
    margin-right: 0;
    margin-bottom: 7px;
  }
`;

export const Nav = styled.div`
  ${desktopCss}
  ${({ theme }) => theme.mediaQueries.md} {
    ${mobileCss}
  }
  z-index: 5;
`;

export const NavLink = styled.a<{ active: boolean }>`
  cursor: pointer;
  color: var(--lido-color-secondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  line-height: 1.7em;
  font-weight: 800;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  text-decoration: none !important;
  letter-spacing: 0.04em;
  opacity: ${(props) => (props.active ? 1 : 0.8)};

  :hover {
    opacity: 1;
    color: var(--lido-color-secondary);
  }

  :visited {
    color: var(--lido-color-secondary);
  }

  :not(:last-of-type) {
    margin-right: 32px;
  }

  svg {
    fill: ${({ active }) =>
      active ? `var(--lido-color-primary)` : `var(--lido-color-secondary)`};
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    text-transform: none;
    font-weight: 500;
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    line-height: 1.2em;
    letter-spacing: 0;
  }
`;
