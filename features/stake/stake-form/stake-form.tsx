import { FC, memo } from 'react';

import { StakeFormProvider } from './stake-form-context';

import { Wallet } from './wallet';
import { StakeAmountInput } from './controls/stake-amount-input';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormInfo } from './stake-form-info';
import { SwapDiscountBanner } from '../swap-discount-banner';
import { StakeBlock, FormControllerStyled } from './styles';
import { L2FromStakeToWrap } from 'shared/banners/l2-banners/l2-from-stake-to-wrap';

export const StakeForm: FC = memo(() => {
  return (
    <StakeFormProvider>
      <Wallet />
      <StakeBlock data-testid="stakeForm">
        <FormControllerStyled>
          <StakeAmountInput />
          <StakeSubmitButton />
          <SwapDiscountBanner>
            <L2FromStakeToWrap />
          </SwapDiscountBanner>
        </FormControllerStyled>
        <StakeFormInfo />
      </StakeBlock>
    </StakeFormProvider>
  );
});
