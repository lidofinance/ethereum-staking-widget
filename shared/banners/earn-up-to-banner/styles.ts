import styled from 'styled-components';
import { LocalLink } from 'shared/components/local-link';

import { BannerWrap } from '../shared-banner-partials';

export const Wrap = styled(BannerWrap)`
  container-type: inline-size;
  container-name: earn-banner-container;
  background: linear-gradient(
    278.02deg,
    rgba(255, 191, 0, 0.15) -0.37%,
    rgba(255, 170, 0, 0.6) 109.06%
  );
  color: var(--lido-color-text);
  overflow: hidden;
  padding: 16px 20px;
`;

export const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const Message = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.md}px;
  line-height: 26px;
  font-weight: 700;
  flex: 1;
  z-index: 2;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
    line-height: 24px;
  }
`;

export const LogoContainer = styled.div`
  position: relative;
  flex: 1 1 114px;
  min-width: 114px;
`;

export const IconWrapper = styled.div`
  position: absolute;
  right: -20px;
  bottom: -20px;
`;

export const OverlayLink = styled(LocalLink)`
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
`;

export const Nowrap = styled.span`
  white-space: nowrap;
`;
