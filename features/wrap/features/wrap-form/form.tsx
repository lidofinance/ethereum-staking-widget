import { FC, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  ButtonIcon,
  Eth,
  Lock,
  Option,
  Steth,
} from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import {
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHContractWeb3,
  useSDK,
} from '@lido-sdk/react';
import { useWeb3 } from '@reef-knot/web3-react';
import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { wrapProcessingWithApprove } from 'features/wrap/utils';
import { TX_OPERATION, TX_STAGE } from 'shared/components';
import { L2Banner } from 'shared/l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { Connect } from 'shared/wallet';
import { InputDecoratorLocked } from 'shared/forms/components/input-decorator-locked';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import {
  FormStyled,
  InputGroupStyled,
  SelectIconWrapper,
  InputWrapper,
} from 'features/wrap/styles';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

const ETH = 'ETH';

const iconsMap = {
  [ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
};

type FromProps = {
  formRef: React.RefObject<HTMLFormElement>;
  selectedToken: keyof typeof iconsMap;
  setSelectedToken: (token: keyof typeof iconsMap) => void;
  setWrappingAmountValue: (value: string) => void;
  setTxOperation: (value: TX_OPERATION) => void;
  setInputValue: (value: string) => void;
  openTxModal: () => void;
  closeTxModal: () => void;
  setTxStage: (value: TX_STAGE) => void;
  setTxHash: (value?: string) => void;
  setTxModalFailedText: (value: string) => void;
  needsApprove: boolean;
  approve: () => Promise<void>;
  inputValue: string;
  wrapGasLimit?: number;
};

export const Form: FC<FromProps> = (props) => {
  const {
    formRef,
    selectedToken,
    setSelectedToken,
    setWrappingAmountValue,
    setTxOperation,
    openTxModal,
    closeTxModal,
    setTxStage,
    setTxHash,
    setTxModalFailedText,
    needsApprove,
    approve,
    setInputValue,
    inputValue,
    wrapGasLimit,
  } = props;

  const { active, account } = useWeb3();
  const { chainId, providerWeb3 } = useSDK();

  const ethBalance = useEthereumBalance(undefined, STRATEGY_LAZY);
  const stethBalance = useSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const [isMultisig] = useIsMultisig();

  const balanceBySelectedToken = useMemo(() => {
    return selectedToken === ETH ? ethBalance.data : stethBalance.data;
  }, [selectedToken, ethBalance.data, stethBalance.data]);

  const wrapProcessing = useCallback(
    async (inputValue, resetForm) => {
      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue(inputValue);

      // Set operation type of transaction
      setTxOperation(
        needsApprove && selectedToken === TOKENS.STETH
          ? TX_OPERATION.APPROVING
          : TX_OPERATION.WRAPPING,
      );

      // Run approving or wrapping
      await wrapProcessingWithApprove(
        chainId,
        providerWeb3,
        wstethContractWeb3,
        openTxModal,
        closeTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        ethBalance.update,
        stethBalance.update,
        inputValue,
        selectedToken,
        needsApprove,
        isMultisig,
        approve,
        resetForm,
      );

      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue('');
    },
    [
      providerWeb3,
      setWrappingAmountValue,
      setTxOperation,
      needsApprove,
      selectedToken,
      chainId,
      wstethContractWeb3,
      openTxModal,
      closeTxModal,
      setTxStage,
      setTxHash,
      setTxModalFailedText,
      ethBalance.update,
      stethBalance.update,
      approve,
      isMultisig,
    ],
  );

  const inputName = `${getTokenDisplayName(selectedToken)} amount`;

  const {
    handleSubmit,
    handleChange,
    error,
    isSubmitting,
    setMaxInputValue,
    isMaxDisabled,
    reset,
  } = useCurrencyInput({
    inputValue,
    inputName,
    setInputValue,
    submit: wrapProcessing,
    limit: balanceBySelectedToken,
    token: selectedToken,
    gasLimit: wrapGasLimit,
  });

  const onChangeSelectToken = useCallback(
    async (value) => {
      if (value === selectedToken) return;
      setSelectedToken(value as keyof typeof iconsMap);
      setInputValue('');
      reset();
      trackEvent(
        ...(value === 'ETH'
          ? MATOMO_CLICK_EVENTS.wrapTokenSelectEth
          : MATOMO_CLICK_EVENTS.wrapTokenSelectSteth),
      );
    },
    [setSelectedToken, setInputValue, reset, selectedToken],
  );

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) {
      setInputValue('');
      reset();
    }
  }, [active, reset, setInputValue]);

  const buttonProps: React.ComponentProps<typeof Button> = {
    fullwidth: true,
    type: 'submit',
    disabled: !!error,
    loading: isSubmitting,
  };

  return (
    <FormStyled
      action=""
      method="post"
      autoComplete="off"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <InputGroupStyled fullwidth>
        <SelectIconWrapper
          icon={iconsMap[selectedToken]}
          value={selectedToken}
          onChange={onChangeSelectToken}
          error={error}
        >
          <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
            {`Lido (${getTokenDisplayName(TOKENS.STETH)})`}
          </Option>
          <Option leftDecorator={iconsMap[ETH]} value={ETH}>
            Ethereum (ETH)
          </Option>
        </SelectIconWrapper>
        <InputWrapper
          fullwidth
          placeholder="0"
          rightDecorator={
            <>
              <InputDecoratorMaxButton
                onClick={setMaxInputValue}
                disabled={isMaxDisabled}
              />
              {account && needsApprove && selectedToken === TOKENS.STETH ? (
                <InputDecoratorLocked />
              ) : (
                ''
              )}
            </>
          }
          label={inputName}
          value={inputValue}
          onChange={handleChange}
          error={!!error}
        />
      </InputGroupStyled>
      {active ? (
        needsApprove && selectedToken === TOKENS.STETH ? (
          <ButtonIcon {...buttonProps} icon={<Lock />}>
            Unlock token to wrap
          </ButtonIcon>
        ) : (
          <Button {...buttonProps}>Wrap</Button>
        )
      ) : (
        <Connect fullwidth />
      )}
      <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerWrap} />
    </FormStyled>
  );
};
