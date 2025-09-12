import styled from 'styled-components';

import { BannerWrap } from '../shared-banner-partials';

export const Wrap = styled(BannerWrap)`
  background: linear-gradient(
    278deg,
    rgba(255, 191, 0, 0.6) -12.23%,
    rgba(255, 191, 0, 0.15) 97.29%
  );
  color: var(--lido-color-text);
  overflow: hidden;
  padding: 16px 20px;
`;

export const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: column;
    gap: 12px;
  }
`;

export const Message = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.md}px;
  line-height: 26px;
  font-weight: 700;
  flex: 1;
  z-index: 2;
`;

export const LogoContainer = styled.div`
  position: relative;
  flex: 0 0 60px;
  min-width: 60px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1;
    min-width: 96px;
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: -34px;
  right: -50px;

  ${({ theme }) => theme.mediaQueries.sm} {
    top: -36px;
    right: -118px;
  }
`;

export const OverlayLink = styled.a`
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  & > button {
    display: none;
  }
`;
