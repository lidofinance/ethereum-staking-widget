import { FC, memo } from 'react';

import { StakeFormProvider } from './stake-form-context';

import { Wallet } from './wallet';
import { StakeAmountInput } from './controls/stake-amount-input';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormInfo } from './stake-form-info';
import { SwapDiscountBanner } from '../swap-discount-banner';
import { StakeBlock, FormControllerStyled } from './styles';
import { DVVBanner } from 'shared/banners/dvv-banner';
import { DualGovernanceBanner } from 'shared/banners/dual-governance-banner';

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
              <DVVBanner />
            </SwapDiscountBanner>
          </DualGovernanceBanner>
        </FormControllerStyled>
        <StakeFormInfo />
      </StakeBlock>
    </StakeFormProvider>
  );
});
