import { useFormState } from 'react-hook-form';
import { asToken } from 'utils/as-token';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';

import { useUsdVaultAvailable } from '../../hooks/use-vault-available';
import { useUSDDepositForm } from '../form-context';
import { useUsdVaultDepositRequest } from '../hooks';
import {
  StyledTooltip,
  StyledQuestionIcon,
  SubmitButtonInnerContainer,
} from './styles';

export const UsdVaultDepositSubmitButton = () => {
  const { disabled } = useFormState();
  const { isDepositLockedForCurrentToken, token: tokenSymbol } =
    useUSDDepositForm();
  const depositRequest = useUsdVaultDepositRequest({
    token: asToken(tokenSymbol),
  });
  const { isUsdVaultAvailable } = useUsdVaultAvailable();

  const shouldSwitchChain = !isUsdVaultAvailable;

  if (shouldSwitchChain) {
    return (
      <SubmitButtonHookForm disabled data-testid="submit-btn">
        Switch to Ethereum Mainnet
      </SubmitButtonHookForm>
    );
  }

  if (isDepositLockedForCurrentToken) {
    return (
      <StyledTooltip
        placement="bottom"
        title={`You already have a pending request in ${tokenSymbol}. To create a new deposit, please select a different token or cancel the existing deposit.`}
      >
        {/*
          `div` wrapper is required around disabled button for the tooltip to work,
          because disabled buttons do not trigger events
        */}
        <div>
          <SubmitButtonHookForm disabled data-testid="submit-btn">
            <SubmitButtonInnerContainer>
              Deposit
              <StyledQuestionIcon />
            </SubmitButtonInnerContainer>
          </SubmitButtonHookForm>
        </div>
      </StyledTooltip>
    );
  }

  return (
    <SubmitButtonHookForm disabled={disabled} data-testid="submit-btn">
      {depositRequest?.isClaimable ? 'Claim and Deposit' : 'Deposit'}
    </SubmitButtonHookForm>
  );
};
