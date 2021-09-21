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

  const unwrapGasLimit = useMemo(() => 140000, []);
  const oneWsteth = useMemo(() => parseEther('1'), []);

  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);
  const stethConverted = useStethByWsteth(oneWsteth);

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
        inputValue,
      );
    },
    [openTxModal, wstethContractWeb3],
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

  useEffect(() => {
    if (wstethBalance && wstethBalance.data) {
      setMaxInputValue();
    }
  }, [wstethBalance, setMaxInputValue]);

  const inputValueBigNumber = useMemo(
    () => parseEther(inputValue ? inputValue : '0'),
    [inputValue],
  );
  const willReceiveSteth = useWstethBySteth(inputValueBigNumber);

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
        <DataTableRow title="Exchange rate" loading={!stethConverted}>
          1 wstETH =
          <FormatToken amount={stethConverted} symbol="stETH" />
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
        willReceiveAmount={formatBalance(willReceiveSteth)}
        willReceiveAmountToken="stETH"
        balance={wstethBalance.data}
      />
    </Block>
  );
};

export default memo(UnWrapForm);
