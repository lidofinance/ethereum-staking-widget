import styled from 'styled-components';
import { CookiesTooltip as CookiesTooltipUI } from '@lidofinance/lido-ui';

import { devicesHeaderMedia } from 'styles/global';
import { NAV_MOBILE_HEIGHT } from 'styles/constants';
import { config } from 'config';

import NoSsrWrapper from '../no-ssr-wrapper';

const StyledCookiesTooltip = styled(CookiesTooltipUI)`
  @media ${devicesHeaderMedia.mobile} {
    bottom: calc(${NAV_MOBILE_HEIGHT}px + env(safe-area-inset-bottom) + 8px);
  }
`;

export const CookiesTooltip = () => {
  return (
    <NoSsrWrapper>
      <StyledCookiesTooltip
        privacyLink={`${config.rootOrigin}/privacy-notice`}
        privacyLinkEnabled={!config.ipfsMode}
      />
    </NoSsrWrapper>
  );
};
