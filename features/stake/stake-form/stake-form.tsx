import { FC, memo } from 'react';

import { EarnUpToBanner } from 'shared/banners/earn-up-to-banner';
import { DualGovernanceBanner } from 'shared/banners/dual-governance-banner';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

import { StakeFormProvider } from './stake-form-context';
import { Wallet } from './wallet';
import { StakeAmountInput } from './controls/stake-amount-input';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormInfo } from './stake-form-info';
import { SwapDiscountBanner } from '../swap-discount-banner';
import { StakeBlock, FormControllerStyled } from './styles';

export const StakeForm: FC = memo(() => {
  return (
    <StakeFormProvider>
      <Wallet />
      <StakeBlock data-testid="stakeForm">
        <FormControllerStyled>
          <StakeAmountInput />
          <StakeSubmitButton />
          <DualGovernanceBanner>
            <SwapDiscountBanner>
              <EarnUpToBanner
                matomoEvent={MATOMO_CLICK_EVENTS_TYPES.vaultsBanner}
              />
            </SwapDiscountBanner>
          </DualGovernanceBanner>
        </FormControllerStyled>
        <StakeFormInfo />
      </StakeBlock>
    </StakeFormProvider>
  );
});
