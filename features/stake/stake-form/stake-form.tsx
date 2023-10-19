import { FC, memo } from 'react';
// import {
//   useSDK,
//   useEthereumBalance,
//   useSTETHBalance,
//   useSTETHContractWeb3,
// } from '@lido-sdk/react';
// import { useWeb3 } from 'reef-knot/web3-react';
import { Block } from '@lidofinance/lido-ui';
import { L2Swap } from 'shared/banners';
// import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
// import { useTxCostInUsd } from 'shared/hooks';
// import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
// import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';
// import { FormStyled, InputStyled } from './styles';
// import { stakeProcessing } from './utils';
// import { useStakeableEther } from '../hooks';
// import { getTokenDisplayName } from 'utils/getTokenDisplayName';
// import { useIsMultisig } from 'shared/hooks/useIsMultisig';
// import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { StakeFormInfo } from './stake-form-info';
import { Wallet } from '../wallet/wallet';
import { StakeFormProvider } from './stake-form-context';
import { StakeSubmitButton } from './controls/stake-submit-button';
import { StakeFormModal } from './stake-form-modal';
import { StakeAmountInput } from './controls/stake-amount-input';
import { FormControllerStyled } from './styles';
import { TransactionModalProvider } from 'shared/transaction-modal';

export const StakeForm: FC = memo(() => {
  return (
    <TransactionModalProvider>
      <StakeFormProvider>
        <Wallet />
        <Block>
          <FormControllerStyled>
            <StakeAmountInput />
            <StakeSubmitButton />
            <L2Swap />
          </FormControllerStyled>
          <StakeFormInfo />
          <StakeFormModal />
        </Block>
      </StakeFormProvider>
    </TransactionModalProvider>
  );
});
