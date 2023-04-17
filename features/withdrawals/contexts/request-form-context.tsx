import {
  FC,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { BigNumber } from 'ethers';
import { TOKENS } from '@lido-sdk/constants';
import { WstethAbi } from '@lido-sdk/contracts';
import invariant from 'tiny-invariant';

import {
  useValidateUnstakeValue,
  useToken,
  useWithdrawalsConstants,
  useInputTvlValidate,
} from 'features/withdrawals/hooks';
import { useInputValidate } from 'shared/hooks';
import { useWeb3 } from 'reef-knot/web3-react';
import { StethPermitAbi } from 'generated';
import { maxNumberValidation } from 'utils';

export type RequestFormContextValue = {
  inputValue: string;
  setInputValue: (value: string) => void;
  error: string;
  setInputTouched: (value: boolean) => void;
  showError: boolean;
  tokenLabel: 'stETH' | 'wstETH';
  tokenContract: StethPermitAbi | WstethAbi | null;
  token: TOKENS.WSTETH | TOKENS.STETH;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeToken: (token: TOKENS.WSTETH | TOKENS.STETH) => void;
  handleResetInput: () => void;
  tvlMessage?: string;
  stakeButton: JSX.Element;
  tokenBalance?: BigNumber;
};
const RequestFormContext = createContext<RequestFormContextValue | null>(null);
RequestFormContext.displayName = 'RequestFormContext';

export const useRequestForm = () => {
  const value = useContext(RequestFormContext);
  invariant(value, 'useRequestForm was used outside RequestFormContext');
  return value;
};

export const RequestFormProvider: FC = ({ children }) => {
  const [inputValue, setInputValue] = useState('');
  const { active } = useWeb3();
  const { minAmount } = useWithdrawalsConstants();
  const { tokenBalance, tokenLabel, tokenContract, setToken, token } =
    useToken();
  const { tvlMessage, stakeButton } = useInputTvlValidate(inputValue);

  const validateUnstakeValue = useValidateUnstakeValue({
    inputName: `${tokenLabel} amount`,
    limit: tokenBalance,
    minimum: minAmount,
  });
  const { error, inputTouched, setInputTouched } = useInputValidate({
    value: inputValue,
    validationFn: validateUnstakeValue,
    shouldValidate: active,
  });

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!inputTouched) setInputTouched(true);
      setInputValue(maxNumberValidation(event?.currentTarget.value));
    },
    [inputTouched, setInputTouched],
  );
  const handleResetInput = useCallback(() => {
    setInputValue('');
    setInputTouched(false);
  }, [setInputTouched]);

  const handleChangeToken = useCallback(
    (token: TOKENS.STETH | TOKENS.WSTETH) => {
      setToken(token);
      handleResetInput();
    },
    [setToken, handleResetInput],
  );
  const showError = active && !!error && !tvlMessage;

  const value = useMemo(
    () => ({
      inputValue,
      setInputValue,
      error,
      setInputTouched,
      showError,
      tokenLabel,
      tokenContract,
      token,
      handleInputChange,
      handleChangeToken,
      handleResetInput,
      tvlMessage,
      stakeButton,
      tokenBalance,
    }),
    [
      inputValue,
      error,
      setInputTouched,
      showError,
      tokenLabel,
      tokenContract,
      token,
      handleInputChange,
      handleChangeToken,
      handleResetInput,
      tvlMessage,
      stakeButton,
      tokenBalance,
    ],
  );

  return (
    <RequestFormContext.Provider value={value}>
      {children}
    </RequestFormContext.Provider>
  );
};
