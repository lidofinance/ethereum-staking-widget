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
import { useCurrencyInput } from 'shared/hooks';
import { wrapProcessingWithApprove } from 'features/wrap/utils';
import { TX_OPERATION, TX_STAGE } from 'shared/components';
import { L2Banner } from 'shared/l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { Connect } from 'shared/wallet';
import { InputLocked } from 'features/wrap/components';
import {
  FormStyled,
  InputGroupStyled,
  MaxButton,
  SelectIconWrapper,
  InputWrapper,
} from 'features/wrap/styles';
import { trackEvent } from '@lidofinance/analytics-matomo';

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
  const { chainId } = useSDK();

  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

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
        wstethContractWeb3,
        openTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        ethBalance.update,
        stethBalance.update,
        inputValue,
        selectedToken,
        needsApprove,
        approve,
        resetForm,
      );

      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue('');
    },
    [
      setWrappingAmountValue,
      setTxOperation,
      needsApprove,
      selectedToken,
      chainId,
      wstethContractWeb3,
      openTxModal,
      setTxStage,
      setTxHash,
      setTxModalFailedText,
      ethBalance.update,
      stethBalance.update,
      approve,
    ],
  );

  const {
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
    isMaxDisabled,
    reset,
  } = useCurrencyInput({
    submit: wrapProcessing,
    limit: balanceBySelectedToken,
    token: selectedToken,
    externalSetInputValue: setInputValue,
    gasLimit: wrapGasLimit,
  });

  const onChangeSelectToken = useCallback(
    async (value) => {
      setSelectedToken(value as keyof typeof iconsMap);
      setMaxInputValue();
      trackEvent(
        ...(value === 'ETH'
          ? MATOMO_CLICK_EVENTS.wrapTokenSelectEth
          : MATOMO_CLICK_EVENTS.wrapTokenSelectSteth),
      );
    },
    [setMaxInputValue, setSelectedToken],
  );

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) {
      setInputValue('');
      reset();
    }
  }, [active, reset, setInputValue]);

  useEffect(() => {
    if (selectedToken) {
      setMaxInputValue();
    }
  }, [selectedToken, setMaxInputValue]);

  const buttonProps: React.ComponentProps<typeof Button> = {
    fullwidth: true,
    type: 'submit',
    disabled: isValidating || !!error,
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
            Lido (STETH)
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
              <MaxButton
                size="xxs"
                variant="translucent"
                onClick={() => {
                  setMaxInputValue();
                }}
                disabled={isMaxDisabled}
              >
                MAX
              </MaxButton>
              {account && needsApprove && selectedToken === TOKENS.STETH ? (
                <InputLocked />
              ) : (
                ''
              )}
            </>
          }
          label="Amount"
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
