import { useFormState } from 'react-hook-form';
import { useSTGAvailable } from '../../hooks/use-stg-available';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useSTGDepositForm } from '../form-context';
import { useDepositRequest } from '../hooks';
import {
  StyledTooltip,
  StyledQuestionIcon,
  SubmitButtonInnerContainer,
} from './styles';

export const STGDepositSubmitButton = () => {
  const { disabled } = useFormState();
  const { isDepositLockedForCurrentToken, token } = useSTGDepositForm();
  const depositRequest = useDepositRequest(token);
  const { isSTGAvailable } = useSTGAvailable();

  const shouldSwitchChain = !isSTGAvailable;

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
        title={`You already have a pending request in ${getTokenDisplayName(token)}. To create a new deposit, please select a different token or cancel the existing deposit.`}
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
