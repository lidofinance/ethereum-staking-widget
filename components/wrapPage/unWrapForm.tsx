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
import { useStethByWsteth, useTxCostInUsd, useCurrencyInput } from 'hooks';
import { runWithTransactionLogger } from 'utils';
import { FormStyled, InputStyled, MaxButton } from './styles';

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
      if (!wstethContractWeb3) {
        return;
      }

      try {
        const callback = () =>
          wstethContractWeb3.unwrap(parseEther(inputValue));

        openTxModal();
        setTxStage(TX_STAGE.SIGN);

        const transaction = await runWithTransactionLogger(
          'Unwrap signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);

        await runWithTransactionLogger('Unwrap block confirmation', async () =>
          transaction.wait(),
        );

        setTxStage(TX_STAGE.SUCCESS);
      } catch (e) {
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        console.error(e);
      }
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
        balance={wstethBalance.data}
      />
    </Block>
  );
};

export default memo(UnWrapForm);
