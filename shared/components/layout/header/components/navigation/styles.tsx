import styled, { css } from 'styled-components';

export const desktopCss = css`
  margin: 0 var(--nav-desktop-gutter-x);
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.xxl}px;

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
  padding: ${({ theme: { spaceMap } }) =>
    `${spaceMap.sm}px ${spaceMap.sm}px max(env(safe-area-inset-bottom), ${spaceMap.sm}px)`};
  background-color: var(--lido-color-foreground);
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.xxl}px;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--lido-color-border);
  height: calc(var(--nav-mobile-height) + env(safe-area-inset-bottom));

  svg {
    margin-right: 0;
    margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const Nav = styled.div`
  ${desktopCss}
  // mobile kicks in on a bit higher width for nav
  @media screen and (max-width: var(--nav-mobile-max-width)) {
    ${mobileCss}
  }
  z-index: 6;
`;

// Not wrapping <a> inside <a> in IPFS mode
// Also avoid problems with migrate to Next v13
// see: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#link-component
export const NavLink = styled.span<{ active: boolean }>`
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

  &:hover {
    opacity: 1;
    color: var(--lido-color-secondary);
  }

  svg {
    fill: ${({ active }) =>
      active ? `var(--lido-color-primary)` : `var(--lido-color-secondary)`};
  }

  @media screen and (max-width: var(--nav-mobile-max-width)) {
    width: ${({ theme }) => theme.spaceMap.xl}px;
    flex-direction: column;
    text-transform: none;
    font-weight: 500;
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    line-height: 1.2em;
    letter-spacing: 0;
  }
`;
