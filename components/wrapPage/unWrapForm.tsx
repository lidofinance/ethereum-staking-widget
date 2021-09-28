import { FC, memo, useCallback, useState, useMemo, useEffect } from 'react';
import { parseEther } from '@ethersproject/units';
import {
  Block,
  DataTable,
  DataTableRow,
  Wsteth,
  Button,
} from '@lidofinance/lido-ui';
import { useWeb3 } from '@lido-sdk/web3-react';
import { useWSTETHBalance, useWSTETHContractWeb3 } from '@lido-sdk/react';
import TxStageModal, { TX_STAGE, TX_OPERATION } from 'components/txStageModal';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect/walletConnect';
import {
  useTxCostInUsd,
  useCurrencyInput,
  useWstethBySteth,
  useStethByWsteth,
} from 'hooks';
import { formatBalance } from 'utils';
import { FormStyled, InputStyled, MaxButton } from './styles';
import { unwrapProcessing } from './processings';

const UnWrapForm: FC = () => {
  const { active } = useWeb3();
  const wstethBalance = useWSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();

  const wstethBalanceAsStringOrNull = useMemo(() => {
    if (!wstethBalance || !wstethBalance.data) {
      return null;
    }

    return formatBalance(wstethBalance.data);
  }, [wstethBalance]);
  const unwrapGasLimit = useMemo(() => 140000, []);
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
    async (inputValue) => {
      await unwrapProcessing(
        wstethContractWeb3,
        openTxModal,
        setTxStage,
        setTxHash,
        wstethBalance.update,
        inputValue,
      );
    },
    [openTxModal, wstethContractWeb3, wstethBalance.update],
  );

  const {
    inputValue,
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
  } = useCurrencyInput({
    submit: unWrapProcessing,
    limit: wstethBalance.data,
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
  const willReceiveStethAsBigNumber = useWstethBySteth(inputValueAsBigNumber);

  return (
    <Block>
      <FormStyled
        action=""
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
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
            disabled={isValidating || isSubmitting}
          >
            Unwrap
          </Button>
        ) : (
          <WalletConnect fullwidth />
        )}
      </FormStyled>

      <DataTable>
        <DataTableRow title="Gas fee" loading={!unwrapTxCostInUsd}>
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
        amount={inputValue}
        amountToken="wstETH"
        willReceiveAmount={formatBalance(willReceiveStethAsBigNumber)}
        willReceiveAmountToken="stETH"
        balance={wstethBalance.data}
        balanceToken="wstETH"
      />
    </Block>
  );
};

export default memo(UnWrapForm);
