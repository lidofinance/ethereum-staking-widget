import { useFormState } from 'react-hook-form';
import { SubmitButtonHookForm } from 'shared/hook-form/controls/submit-button-hook-form';
import {
  StyledTooltip,
  StyledQuestionIcon,
  SubmitButtonInnerContainer,
} from './styles';

type VaultDepositSubmitButtonProps = {
  isVaultAvailable: boolean;
  isDepositLockedForCurrentToken: boolean;
  tokenDisplayName: string;
  isClaimable: boolean;
};

export const VaultDepositSubmitButton = ({
  isVaultAvailable,
  isDepositLockedForCurrentToken,
  tokenDisplayName,
  isClaimable,
}: VaultDepositSubmitButtonProps) => {
  const { disabled } = useFormState();

  // Only show contextual states when the form isn't already disabled,
  // to avoid overwhelming the user with multiple disabled states and tooltips at once
  if (!disabled) {
    if (!isVaultAvailable) {
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
          title={`You already have a pending request in ${tokenDisplayName}. To create a new deposit, please select a different token or cancel the existing deposit.`}
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
  }

  return (
    <SubmitButtonHookForm disabled={disabled} data-testid="submit-btn">
      {isClaimable ? 'Claim and Deposit' : 'Deposit'}
    </SubmitButtonHookForm>
  );
};
