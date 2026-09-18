import { LocalLink } from 'shared/components/local-link';
import styled, { css } from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';
import { POPUP_MENU_Z_INDEX, PopupStyled } from '../popup';

export const desktopCss = css`
  margin: 0 ${({ theme }) => theme.spaceMap.xxl}px 0 var(--nav-desktop-gutter-x);
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

export const Nav = styled.nav`
  ${desktopCss}
  // mobile kicks in on a bit higher width for nav
  @media ${devicesHeaderMedia.mobile} {
    ${mobileCss}
  }
  z-index: 60;
`;

// Not wrapping <a> inside <a> in IPFS mode
// Also avoid problems with migrate to Next v13
// see: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#link-component
export const NavLink = styled.span<{ active: boolean; showNew?: boolean }>`
  cursor: pointer;
  position: relative;
  color: color-mix(in srgb, var(--lido-color-secondary) 80%, transparent);
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  line-height: 1.7em;
  font-weight: 800;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-decoration: none !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  user-select: none;

  & > svg {
    opacity: ${(props) => (props.active ? 1 : 0.8)};
    color: var(--lido-color-secondary);
    fill: var(--lido-color-secondary);
  }

  &:hover {
    color: var(--lido-color-secondary);
    & > svg {
      opacity: 1;
    }
  }

  ${({ active }) =>
    active &&
    css`
      color: var(--lido-color-secondary);
      svg {
        opacity: 1;
        color: var(--lido-color-primary);
        fill: var(--lido-color-primary);
      }
    `}

  ${({ showNew }) =>
    showNew &&
    css`
      span::after {
        content: 'NEW';
        display: inline;
        margin-left: ${({ theme }) => theme.spaceMap.sm}px;
        padding: ${({ theme }) => theme.spaceMap.xs}px;
        font-weight: 700;
        background-color: var(--lido-color-error);
        color: #ffffff;
        border-radius: ${({ theme }) => theme.borderRadiusesMap.xs}px;
      }
    `}

  @media ${devicesHeaderMedia.mobile} {
    width: ${({ theme }) => theme.spaceMap.xl}px;
    flex-direction: column;
    text-transform: none;
    font-weight: 500;
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    line-height: 1.2em;
    letter-spacing: 0;

    span::after {
      margin-left: ${({ theme }) => theme.spaceMap.xs}px;
    }
  }
`;

/**
 * Nested Navigation styles
 */

export const NavigationDropDownButton = styled.div`
  z-index: ${POPUP_MENU_Z_INDEX + 1};
  position: relative;
`;

export const NavigationDropDownLink = styled(LocalLink)<{ $active: boolean }>`
  display: flex;
  padding: 12px 16px;
  align-items: center;
  gap: 8px;
  align-self: stretch;

  color: var(--lido-color-secondary);
  font-size: 12px;
  line-height: 20px;
  text-transform: initial;

  &:visited {
    color: var(--lido-color-secondary);
  }

  // Fix the highlight by click
  -webkit-tap-highlight-color: transparent;
  outline: none;

  // Backgrounds
  background: var(--lido-color-controlBg);

  ${({ theme, $active }) =>
    $active &&
    css`
      background: ${theme.name === 'dark' ? '#34343D' : '#000A3D08'};
    `}

  &:not(:disabled):hover {
    ${({ theme }) => css`
      background: ${theme.name === 'dark' ? '#34343D' : '#000A3D08'};
    `}
  }
`;

export const NavigationDropDownArrow = styled.div<{ $opened: boolean }>`
  border: 3px solid #7a8aa0;
  border-bottom-width: 0;
  border-left-color: transparent;
  border-right-color: transparent;

  margin: 9px;
  height: 4px;

  transform: rotate(${({ $opened }) => ($opened ? 180 : 0)}deg);
  transition: transform ${({ theme }) => theme.duration.norm} ease;

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

export const NavigationDropDownMenu = styled(PopupStyled)`
  top: calc(100% + 9px);
  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

/**
 * Mobile Nested Navigation styles
 */

/**
 * Sizes the container so it's always aligns with main content
 */
export const MobileOnlySubNavigationSizer = styled.div`
  margin: 0 auto 20px;
  max-width: 560px;
  // Padding to align with main content, it changes padding on lg breakpoint
  // but mobile navigation appears on separate breakpoint
  padding-inline: ${({ theme }) => theme.spaceMap.xxl}px;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding-inline: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;

/**
 * Main container for links, horizontally scrollable and contains active bar indicator
 */
export const MobileOnlySubNavigationWrapper = styled.nav`
  display: none;
  @media ${devicesHeaderMedia.mobile} {
    display: flex;
  }
  position: relative;

  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  max-height: 40px;
  height: 40px;
  gap: 10px;
  margin: 0 auto;

  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  border-bottom: 1px solid rgba(0, 10, 61, 0.12);
`;

/**
 * Positioned via CSS variables measured from the active link,
 * see MobileSubNavigation
 */
export const MobileOnlySubNavigationActiveBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  // position is persisted on <html> across page remounts, see MobileSubNavigation
  transform: translateX(var(--sub-nav-bar-left, 0px));
  width: var(--sub-nav-bar-width, 0px);
  background-color: var(--lido-color-accentText);
  pointer-events: none;

  &[data-ready='true'] {
    transition:
      transform ${({ theme }) => theme.duration.norm} ease,
      width ${({ theme }) => theme.duration.norm} ease;
  }
`;

export const MobileOnlySubNavigationLinkBackdrop = styled(LocalLink)`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: none;
  @media ${devicesHeaderMedia.mobile} {
    display: block;
  }
`;

export const MobileOnlySubNavigationLink = styled(LocalLink)`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spaceMap.sm}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
  line-height: ${({ theme }) => theme.spaceMap.xl}px;

  color: var(--lido-color-textSecondary);
  &:visited {
    color: var(--lido-color-textSecondary);
  }
  &[data-active='true'] {
    color: var(--lido-color-text);
    &:visited {
      color: var(--lido-color-text);
    }
  }
`;
