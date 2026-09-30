import { LocalLink } from 'shared/components/local-link';
import styled, { css } from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

export const desktopCss = css`
  margin: 0 ${({ theme }) => theme.spaceMap.xxl}px 0 var(--nav-desktop-gutter-x);
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.xxl}px;

  svg {
    margin-right: 10px;
  }
`;

export const Nav = styled.nav`
  ${desktopCss}
  // mobile layout uses MobileNavigationBar instead
  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
  z-index: 60;
`;

const newBadgeCss = css`
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

  ${({ showNew }) => showNew && newBadgeCss}
`;

/**
 * Desktop sub-navigation: a row anchored under the section link with an L-connector
 */

const SUB_NAV_OFFSET_X = 46;
const SUB_NAV_GAP_Y = 26;
const SUB_NAV_HEIGHT = 48;
// the section link icon is 24px wide
const SECTION_ICON_CENTER_X = 12;
const subNavTransitionCss = css`
  transition:
    opacity 180ms ease,
    transform 220ms ease,
    visibility 0s var(--sub-nav-visibility-delay);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SubNavigationAnchor = styled.div`
  position: relative;
`;

export const SubNavigationRow = styled.nav<{ $expanded: boolean }>`
  position: absolute;
  top: calc(100% + ${SUB_NAV_GAP_Y}px);
  left: ${SUB_NAV_OFFSET_X}px;
  display: flex;
  gap: 4px;
  height: ${SUB_NAV_HEIGHT}px;
  padding: 6px;

  background: var(--lido-color-foreground);
  border-radius: 12px;
  white-space: nowrap;

  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  transform: translateY(${({ $expanded }) => ($expanded ? 0 : -6)}px);
  // hidden only after fading out, so hidden links are out of focus order
  visibility: ${({ $expanded }) => ($expanded ? 'visible' : 'hidden')};
  --sub-nav-visibility-delay: ${({ $expanded }) => ($expanded ? '0s' : '180ms')};
  ${subNavTransitionCss}

  &::before {
    content: '';
    position: absolute;
    left: ${-(SUB_NAV_OFFSET_X - SECTION_ICON_CENTER_X)}px;
    top: ${-(SUB_NAV_GAP_Y - 6)}px;
    width: ${SUB_NAV_OFFSET_X - SECTION_ICON_CENTER_X - 2}px;
    height: ${SUB_NAV_GAP_Y - 6 + SUB_NAV_HEIGHT / 2}px;

    border-left: 1.5px solid var(--lido-color-border);
    border-bottom: 1.5px solid var(--lido-color-border);
    border-bottom-left-radius: 8px;
  }
`;

export const SubNavigationLink = styled(LocalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;

  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 500;
  line-height: 20px;

  &,
  &:visited {
    color: var(--lido-color-textSecondary);
  }

  &:hover {
    color: var(--lido-color-text);
  }

  // overrides the nav-wide svg margin
  && svg {
    width: 18px;
    height: 18px;
    margin: 0;
    fill: currentColor;
  }

  &[aria-current='page'] {
    color: var(--lido-color-text);
    font-weight: 700;

    svg {
      color: var(--lido-color-primary);
    }
  }

  outline: none;
  &:focus-visible {
    outline: 2px solid var(--lido-color-primary);
  }
`;

// reserves the space the absolutely positioned row takes under the header
export const DesktopSubNavigationSpacer = styled.div<{ $expanded: boolean }>`
  height: ${({ $expanded }) => ($expanded ? SUB_NAV_HEIGHT + 12 : 0)}px;
  transition: height 220ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

/**
 * Mobile Navigation styles
 */

export const MobileNav = styled.nav`
  display: none;
  @media ${devicesHeaderMedia.mobile} {
    display: block;
  }

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  padding-bottom: var(--nav-mobile-bottom-inset);

  background: var(--lido-color-foreground);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(39, 56, 82, 0.08);
`;

const mobileNavFocusCss = css`
  -webkit-tap-highlight-color: transparent;
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--lido-color-primary);
  }
`;

// grid rows animate between 0 and the content height without hardcoding it
export const MobileTrackCollapse = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? '1fr' : '0fr')};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  // hidden only after collapsing, so collapsed links are out of focus order
  visibility: ${({ $expanded }) => ($expanded ? 'visible' : 'hidden')};
  transition:
    grid-template-rows 220ms ease,
    opacity 180ms ease,
    visibility 0s ${({ $expanded }) => ($expanded ? '0s' : '220ms')};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const MobileTrackClip = styled.div`
  min-height: 0;
  overflow: hidden;
`;

const TRACK_PADDING = 3;
const TRACK_GAP = 2;

export const MobileTrack = styled.nav<{ $count: number }>`
  position: relative;
  display: grid;
  // equal columns, the pill position is computed from the index
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  gap: ${TRACK_GAP}px;
  margin: 10px 10px 0;
  padding: ${TRACK_PADDING}px;

  background: var(--lido-color-background);
  border-radius: 14px;
`;

// active background, slides between items
export const MobileTrackPill = styled.div<{ $count: number; $index?: number }>`
  position: absolute;
  top: ${TRACK_PADDING}px;
  bottom: ${TRACK_PADDING}px;
  left: ${TRACK_PADDING}px;
  width: calc(
    (100% - ${({ $count }) => TRACK_PADDING * 2 + TRACK_GAP * ($count - 1)}px) /
      ${({ $count }) => $count}
  );
  transform: translateX(
    calc(${({ $index = 0 }) => $index} * (100% + ${TRACK_GAP}px))
  );
  opacity: ${({ $index }) => ($index === undefined ? 0 : 1)};

  background: var(--lido-color-foreground);
  border-radius: 11px;
  box-shadow: 0 1px 4px rgba(39, 56, 82, 0.12);
  transition: transform 220ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const MobileTrackLink = styled(LocalLink)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 11px;

  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  &,
  &:visited,
  &:hover {
    color: var(--lido-color-textSecondary);
  }

  // 44px tap zone
  &::after {
    content: '';
    position: absolute;
    inset: -2px 0;
  }

  &[aria-current='page'] {
    color: var(--lido-color-text);
  }

  ${mobileNavFocusCss}
`;

export const MobileTabs = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, 1fr);
  padding: 6px 8px;
`;

export const MobileTabIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 30px;
  border-radius: 15px;
  transition: background-color ${({ theme }) => theme.duration.fast} ease;

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

export const MobileTabLink = styled(LocalLink)<{ $showNew?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;

  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 700;
  line-height: 1.2;

  &,
  &:visited,
  &:hover {
    color: var(--lido-color-textSecondary);
  }

  &[aria-current='page'] {
    color: var(--lido-color-text);

    ${MobileTabIcon} {
      color: var(--lido-color-primary);
    }
  }

  // press feedback instead of the default tap highlight
  &:active ${MobileTabIcon} {
    background: color-mix(in srgb, var(--lido-color-primary) 10%, transparent);
  }

  ${({ $showNew }) => $showNew && newBadgeCss}
  ${mobileNavFocusCss}
`;
