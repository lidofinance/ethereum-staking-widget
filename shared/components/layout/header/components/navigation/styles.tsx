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
  @media ${devicesHeaderMedia.mobile} {
    ${mobileCss}
  }
  z-index: 6;
`;

export const Divider = styled.div`
  width: 1px;
  height: 12px;
  align-self: center;
  background-color: var(--lido-color-textSecondary);

  ${({ theme }) =>
    theme.name == 'dark' &&
    css`
      background-color: #fff;
      opacity: 0.8;
    `}

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

// Not wrapping <a> inside <a> in IPFS mode
// Also avoid problems with migrate to Next v13
// see: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#link-component
export const NavLink = styled.span<{ active: boolean; showNew?: boolean }>`
  cursor: pointer;
  color: color-mix(in srgb, var(--lido-color-secondary) 80%, transparent);
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
