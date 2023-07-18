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
import { useWeb3 } from 'reef-knot/web3-react';
import {
  useSDK,
  useSTETHBalance,
  useWSTETHBalance,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import { L2Banner } from 'shared/l2-banner';
import { MATOMO_CLICK_EVENTS } from 'config';
import { useTxCostInUsd, useStethByWsteth } from 'shared/hooks';
import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';
import { formatBalance } from 'utils';
import { Connect } from 'shared/wallet';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import { FormStyled, InputStyled } from 'features/wrap/styles';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { unwrapProcessing } from 'features/wrap/utils';
import { useUnwrapGasLimit } from './hooks';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { FormatToken } from 'shared/formatters/format-token';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';

export const UnwrapForm: FC = memo(() => {
  const { active, chainId } = useWeb3();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();
  const { providerWeb3 } = useSDK();
  const [isMultisig] = useIsMultisig();

  const formRef = useRef<HTMLFormElement>(null);

  // Needs for fix flashing balance in tx success modal
  const [wrappingAmountValue, setWrappingAmountValue] = useState('');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');
  const [inputValue, setInputValue] = useState('');

  const unwrapGasLimit = useUnwrapGasLimit();

  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);

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
        providerWeb3,
        wstethContractWeb3,
        openTxModal,
        closeTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        wstethBalance.update,
        stethBalance.update,
        chainId,
        inputValue,
        resetForm,
        isMultisig,
      );

      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue('');
    },
    [
      providerWeb3,
      wstethContractWeb3,
      openTxModal,
      closeTxModal,
      wstethBalance.update,
      stethBalance.update,
      chainId,
      isMultisig,
    ],
  );

  const token = TOKENS.WSTETH;
  const inputName = `${getTokenDisplayName(token)} amount`;

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
    setInputValue,
    inputName,
    submit: unWrapProcessing,
    limit: wstethBalance.data,
    token,
  });

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
            <InputDecoratorMaxButton
              onClick={setMaxInputValue}
              disabled={isMaxDisabled}
            />
          }
          label={inputName}
          value={inputValue}
          onChange={handleChange}
          error={error}
        />
        {active ? (
          <Button
            fullwidth
            type="submit"
            disabled={!!error}
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
        <DataTableRowStethByWsteth />
        <DataTableRow title="You will receive">
          <FormatToken amount={willReceiveStethAsBigNumber} symbol="stETH" />
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
        onRetry={() => formRef.current?.requestSubmit()}
      />
    </Block>
  );
});
