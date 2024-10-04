import { Steth } from '@lidofinance/lido-ui';
import { useWatch } from 'react-hook-form';

import { TokenAmountInputHookForm } from 'shared/hook-form/controls/token-amount-input-hook-form';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

type TokenAmountInputWrapProps = Pick<
  React.ComponentProps<typeof TokenAmountInputHookForm>,
  'warning'
>;

export const TokenAmountInputWrap = (props: TokenAmountInputWrapProps) => {
  const {
    isWalletConnected,
    isAccountActiveOnL2,
    isDappActiveAndNetworksMatched,
  } = useDappStatus();
  const token = useWatch<WrapFormInputType, 'token'>({ name: 'token' });
  const { maxAmount, isApprovalNeededBeforeWrap } = useWrapFormData();

  return (
    <TokenAmountInputHookForm
      disabled={isWalletConnected && !isDappActiveAndNetworksMatched}
      fieldName="amount"
      token={token}
      data-testid="wrapInput"
      isLocked={isApprovalNeededBeforeWrap}
      maxValue={maxAmount}
      showErrorMessage={false}
      leftDecorator={
        isAccountActiveOnL2 && isDappActiveAndNetworksMatched ? (
          <Steth />
        ) : undefined
      }
      {...props}
    />
  );
};
