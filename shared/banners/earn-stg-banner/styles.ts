import styled from 'styled-components';
import { LocalLink } from 'shared/components/local-link';

import { BannerWrap } from '../shared-banner-partials';

export const Wrap = styled(BannerWrap)`
  background: linear-gradient(
    277.73deg,
    rgba(6, 101, 252, 0.6) -12.23%,
    rgba(6, 101, 252, 0.15) 97.29%
  );
  color: var(--lido-color-text);
  overflow: hidden;
  padding: 16px 20px;
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
  flex: 0 0 184px;
  min-width: 184px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1;
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: -46px;
  right: -19px;

  ${({ theme }) => theme.mediaQueries.md} {
    right: 35px;
  }
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
