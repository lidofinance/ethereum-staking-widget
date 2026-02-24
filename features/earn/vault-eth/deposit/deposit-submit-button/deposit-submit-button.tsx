import { useFormState } from 'react-hook-form';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { getTokenSymbol } from 'utils/get-token-symbol';
import { useETHDepositForm } from '../form-context';
import { useEthVaultDepositRequest } from '../hooks';
import {
  StyledTooltip,
  StyledQuestionIcon,
  SubmitButtonInnerContainer,
} from './styles';

export const EthVaultDepositSubmitButton = () => {
  const { disabled } = useFormState();
  const { isDepositLockedForCurrentToken, token } = useETHDepositForm();
  const depositRequest = useEthVaultDepositRequest({ token });
  const { isEthVaultAvailable } = useEthVaultAvailable();

  const shouldSwitchChain = !isEthVaultAvailable;

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
        title={`You already have a pending request in ${getTokenSymbol(token)}. To create a new deposit, please select a different token or cancel the existing deposit.`}
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
