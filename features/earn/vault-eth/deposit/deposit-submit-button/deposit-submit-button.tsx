import { useFormState } from 'react-hook-form';
import { useEthVaultAvailable } from '../../hooks/use-vault-available';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import { useETHDepositForm } from '../form-context';
import { useEthVaultDepositRequests } from '../hooks';
import {
  StyledTooltip,
  StyledQuestionIcon,
  SubmitButtonInnerContainer,
} from './styles';
import { TOKEN_SYMBOLS } from 'consts/tokens';

export const EthVaultDepositSubmitButton = () => {
  const { disabled } = useFormState();
  const { isDepositLockedForCurrentToken, token } = useETHDepositForm();
  // stETH deposits go through the wstETH queue, so check wstETH for claimable request state
  const depositRequests = useEthVaultDepositRequests();
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
    const isStETH = token === TOKEN_SYMBOLS.steth;
    const tokenText = isStETH ? 'stETH (which is wrapped into wstETH)' : token;
    return (
      <StyledTooltip
        placement="bottom"
        title={`You already have a pending request in ${tokenText}. To create a new deposit, please select a different token or cancel the existing deposit.`}
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
      {depositRequests?.claimableRequests.length > 0
        ? 'Claim and Deposit'
        : 'Deposit'}
    </SubmitButtonHookForm>
  );
};
