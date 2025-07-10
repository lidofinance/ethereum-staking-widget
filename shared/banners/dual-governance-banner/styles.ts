import styled from 'styled-components';
import { BannerWrap, BannerTitleText } from '../shared-banner-partials';

import type { DGWarningState } from 'shared/hooks/useDGWarningStatus';

interface BannerWrapperProps {
  $state?: DGWarningState;
}
export const BannerWrapper = styled(BannerWrap).attrs<BannerWrapperProps>(
  ({ $state }) => ({
    $state: $state,
  }),
)<BannerWrapperProps>`
  background: ${({ $state }) => {
    if ($state === 'Blocked') return '#e14d4d33';
    return '#ec860033'; // Warning state and fallback for other states
  }};
  color: var(--lido-color-text);
`;

export const BannerTitle = styled(BannerTitleText)`
  font-weight: 700;
`;

export const BannerDescription = styled.div`
  color: var(--lido-color-text);
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  margin-top: 5px;
`;

export const BannerLinkContainer = styled.div`
  margin-top: 16px;
`;
