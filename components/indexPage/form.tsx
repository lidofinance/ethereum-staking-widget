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
import WalletConnect from 'components/walletConnect/walletConnect';
import { useCurrencyInput, useTxCostInUsd } from 'hooks';
import { useStethSubmitGasLimit } from './hooks';
import { FC, memo, useCallback, useState, useMemo } from 'react';
import { FormStyled, InputStyled } from './styles';
import StakeModal, { TX_STAGE } from './stakeModal';
import { runWithTransactionLogger } from 'utils';
import { DATA_UNAVAILABLE } from '../../config';

const StakeForm: FC = () => {
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();

  const { active } = useWeb3();
  const eth = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const steth = useSTETHContractWeb3();

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const submitGasLimit = useStethSubmitGasLimit(AddressZero, {
    value: parseEther('1'),
  });

  const txCostInUsd = useTxCostInUsd(submitGasLimit);

  const submit = useCallback(
    async (inputValue) => {
      if (steth) {
        try {
          const callback = () =>
            steth.submit(AddressZero, {
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
        } catch (e) {
          setTxStage(TX_STAGE.FAIL);
          setTxHash(undefined);
          console.error(e);
        }
      }
    },
    [openTxModal, steth],
  );

  const {
    inputValue,
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
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

  const contractRpc = useSTETHContractRPC();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  return (
    <Block>
      <FormStyled action="" method="post" onSubmit={handleSubmit}>
        <InputStyled
          fullwidth
          placeholder="0"
          leftDecorator={<Eth />}
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
      <StakeModal
        open={txModalOpen}
        onClose={closeTxModal}
        txStage={txStage}
        txHash={txHash}
        amount={inputValue}
        balance={stethBalance.data}
      />
    </Block>
  );
};

export default memo(StakeForm);
