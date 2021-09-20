import { FC, memo, useCallback, useState, useMemo } from 'react';
import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import {
  useContractSWR,
  useEthereumBalance,
  useSTETHBalance,
  useSTETHContractRPC,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  Block,
  Button,
  DataTable,
  DataTableRow,
  Eth,
} from '@lidofinance/lido-ui';
import { DATA_UNAVAILABLE } from 'config';
import WalletConnect from 'components/walletConnect/walletConnect';
import TxStageModal, { TX_STAGE, TX_OPERATION } from 'components/txStageModal';
import { useCurrencyInput, useTxCostInUsd } from 'hooks';
import { runWithTransactionLogger } from 'utils';
import { useStethSubmitGasLimit } from './hooks';
import { FormStyled, InputStyled, MaxButton } from './styles';

const StakeForm: FC = () => {
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();

  const { active } = useWeb3();
  const eth = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const stethContractWeb3 = useSTETHContractWeb3();
  const contractRpc = useSTETHContractRPC();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  const submitGasLimit = useStethSubmitGasLimit(AddressZero, {
    value: parseEther('1'),
  });

  const txCostInUsd = useTxCostInUsd(submitGasLimit);

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const submit = useCallback(
    async (inputValue, resetForm) => {
      if (stethContractWeb3) {
        try {
          const callback = () =>
            stethContractWeb3.submit(AddressZero, {
              value: parseEther(inputValue),
            });

          openTxModal();
          setTxStage(TX_STAGE.SIGN);
          const transaction = await runWithTransactionLogger(
            'Stake signing',
            callback,
          );

          setTxHash(transaction.hash);
          setTxStage(TX_STAGE.BLOCK);
          await runWithTransactionLogger('Stake block confirmation', async () =>
            transaction.wait(),
          );

          setTxStage(TX_STAGE.SUCCESS);

          resetForm();
        } catch (e) {
          setTxStage(TX_STAGE.FAIL);
          setTxHash(undefined);
          console.error(e);
        }
      }
    },
    [openTxModal, stethContractWeb3],
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
    submit,
    limit: eth.data,
  });

  const willReceiveStEthValue = useMemo(() => {
    if (!inputValue) {
      return 0;
    }

    return inputValue;
  }, [inputValue]);

  return (
    <Block>
      <FormStyled action="" method="post" onSubmit={handleSubmit}>
        <InputStyled
          fullwidth
          placeholder="0"
          leftDecorator={<Eth />}
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
            Submit
          </Button>
        ) : (
          <WalletConnect fullwidth />
        )}
      </FormStyled>
      <DataTable>
        <DataTableRow title="You will receive">
          {willReceiveStEthValue} stETH
        </DataTableRow>
        <DataTableRow title="Exchange rate">1 ETH = 1 stETH</DataTableRow>
        <DataTableRow title="Transaction cost" loading={!txCostInUsd}>
          ${txCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow
          title="Reward fee"
          loading={lidoFee.initialLoading}
          help="Please note: this fee applies to staking rewards/earnings only,
          and is NOT taken from your staked amount. It is a fee on earnings only."
        >
          {!lidoFee.data ? DATA_UNAVAILABLE : `${lidoFee.data / 100}%`}
        </DataTableRow>
      </DataTable>
      <TxStageModal
        open={txModalOpen}
        onClose={closeTxModal}
        txStage={txStage}
        txOperation={TX_OPERATION.STAKING}
        txHash={txHash}
        amount={inputValue}
        balance={stethBalance.data}
      />
    </Block>
  );
};

export default memo(StakeForm);
