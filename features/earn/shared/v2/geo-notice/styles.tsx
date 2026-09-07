import styled from 'styled-components';
import { Loader } from '@lidofinance/lido-ui';

// matches SwitchStyled's bottom margin, so the panel spacing is unchanged
// whether the notice is rendered above it or not
export const GeoNoticeWrapper = styled.div`
  margin: 0 0 ${({ theme }) => theme.spaceMap.lg}px;
`;

export const GeoNoticeLoader = styled(Loader).attrs({ size: 'small' })`
  flex: 0 0 auto;
`;

// stands in for CardCta, so it keeps that slot's top margin
export const VaultCardGeoNoticeWrapper = styled.div`
  margin-top: 32px;
`;
