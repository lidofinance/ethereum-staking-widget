import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { DVV_DEPOSIT_PATH } from 'features/earn/consts';

import { BreakdownContainer, BreakdownSection } from './styles';

export const DVVAprBreakdown = () => {
  return (
    <BreakdownContainer>
      <BreakdownSection>
        <span>
          7-day average APR after{' '}
          <LinkInpageAnchor pagePath={DVV_DEPOSIT_PATH} hash="#deposit-fee">
            fees
          </LinkInpageAnchor>
        </span>
      </BreakdownSection>
      <BreakdownSection>
        APR is the annual percentage rate without compounding
      </BreakdownSection>
    </BreakdownContainer>
  );
};
