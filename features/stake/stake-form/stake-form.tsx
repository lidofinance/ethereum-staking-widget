import { FC, memo } from 'react';
import { Block } from '@lidofinance/lido-ui';

import { StakeFormProvider } from './stake-form-context';

import { Wallet } from './wallet';
import { StakeAmountInput } from './controls/stake-amount-input';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormInfo } from './stake-form-info';
import { SwapDiscountBanner } from '../swap-discount-banner';
import { FormControllerStyled } from './styles';

export const StakeForm: FC = memo(() => {
  return (
    <StakeFormProvider>
      <Wallet />
      <Block data-testid="stakeForm">
        <FormControllerStyled>
          <StakeAmountInput />
          <StakeSubmitButton />
          <SwapDiscountBanner />
        </FormControllerStyled>
        <StakeFormInfo />
      </Block>
    </StakeFormProvider>
  );
});
