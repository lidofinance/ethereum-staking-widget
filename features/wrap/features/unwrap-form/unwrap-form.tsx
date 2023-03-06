import {
  FC,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { parseEther } from '@ethersproject/units';
import {
  Block,
  DataTable,
  DataTableRow,
  Wsteth,
  Button,
} from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import { useWeb3 } from '@reef-knot/web3-react';
import {
  useSTETHBalance,
  useWSTETHBalance,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import { L2Banner } from 'shared/l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import {
  useTxCostInUsd,
  useCurrencyInput,
  useStethByWsteth,
} from 'shared/hooks';
import { formatBalance } from 'utils';
import { Connect } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import { FormStyled, InputStyled, MaxButton } from 'features/wrap/styles';
import { unwrapProcessing } from 'features/wrap/utils';
import { useUnwrapGasLimit } from './hooks';

export const UnwrapForm: FC = memo(() => {
  const { active, chainId } = useWeb3();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const formRef = useRef<HTMLFormElement>(null);

  // Needs for fix flashing balance in tx success modal
  const [wrappingAmountValue, setWrappingAmountValue] = useState('');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');

  const wstethBalanceAsStringOrNull = useMemo(() => {
    if (!wstethBalance?.data) {
      return null;
    }

    return formatBalance(wstethBalance.data);
  }, [wstethBalance.data]);
  const unwrapGasLimit = useUnwrapGasLimit();
  const oneWstethAsBigNumber = useMemo(() => parseEther('1'), []);

  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);
  const oneWstethConvertedToStethAsBigNumber =
    useStethByWsteth(oneWstethAsBigNumber);

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const unWrapProcessing = useCallback(
    async (inputValue, resetForm) => {
      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue(inputValue);

      await unwrapProcessing(
        wstethContractWeb3,
        openTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        wstethBalance.update,
        stethBalance.update,
        chainId,
        inputValue,
        resetForm,
      );

      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue('');
    },
    [
      wstethContractWeb3,
      openTxModal,
      wstethBalance.update,
      stethBalance.update,
      chainId,
    ],
  );

  const {
    inputValue,
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
    isMaxDisabled,
    reset,
  } = useCurrencyInput({
    submit: unWrapProcessing,
    limit: wstethBalance.data,
    token: TOKENS.WSTETH,
  });

  // Set max wsteth balance to input field after page loaded.
  // We can't use this `wstethBalance` var, because `wstethBalance` is object,
  // so we get a input field that can't be changed.
  useEffect(() => {
    if (wstethBalanceAsStringOrNull) {
      setMaxInputValue();
    }
  }, [wstethBalanceAsStringOrNull, setMaxInputValue]);

  // Needs for tx modal
  const inputValueAsBigNumber = useMemo(() => {
    try {
      return parseEther(inputValue ? inputValue : '0');
    } catch {
      return parseEther('0');
    }
  }, [inputValue]);
  const willReceiveStethAsBigNumber = useStethByWsteth(inputValueAsBigNumber);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) {
      reset();
    }
  }, [active, reset]);

  return (
    <Block>
      <FormStyled
        action=""
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <InputStyled
          fullwidth
          placeholder="0"
          leftDecorator={<Wsteth />}
          rightDecorator={
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
          }
          label="Amount"
          value={inputValue}
          onChange={handleChange}
          error={error}
        />
        {active ? (
          <Button
            fullwidth
            type="submit"
            disabled={isValidating}
            loading={isSubmitting}
          >
            Unwrap
          </Button>
        ) : (
          <Connect fullwidth />
        )}
        <L2Banner matomoEvent={MATOMO_CLICK_EVENTS.l2BannerUnwrap} />
      </FormStyled>

      <DataTable>
        <DataTableRow title="Max gas fee" loading={!unwrapTxCostInUsd}>
          ${unwrapTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow
          title="Exchange rate"
          loading={!oneWstethConvertedToStethAsBigNumber}
        >
          1 wstETH =
          <FormatToken
            amount={oneWstethConvertedToStethAsBigNumber}
            symbol="stETH"
          />
        </DataTableRow>
      </DataTable>

      <TxStageModal
        open={txModalOpen}
        onClose={closeTxModal}
        txStage={txStage}
        txOperation={TX_OPERATION.UNWRAPPING}
        txHash={txHash}
        amount={wrappingAmountValue}
        amountToken="wstETH"
        willReceiveAmount={formatBalance(willReceiveStethAsBigNumber)}
        willReceiveAmountToken="stETH"
        balance={stethBalance.data}
        balanceToken="stETH"
        failedText={txModalFailedText}
        formRef={formRef}
      />
    </Block>
  );
});
