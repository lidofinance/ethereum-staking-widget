import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import {
  useEthereumBalance,
  useSTETHBalance,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  Block,
  Button,
  DataTable,
  DataTableRow,
  Steth,
} from '@lidofinance/lido-ui';
import WalletConnect from 'components/walletConnect/walletConnect';
import { useCurrencyInput, useTxCostInUsd } from 'hooks';
import { useStethSubmitGasLimit } from './hooks';
import { FC, memo, useCallback, useState } from 'react';
import { FormStyled, InputStyled } from './styles';
import StakeModal, { TX_STAGE } from './stakeModal';
import { runWithTransactionLogger } from 'utils';

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

  return (
    <Block>
      <FormStyled action="" method="post" onSubmit={handleSubmit}>
        <InputStyled
          fullwidth
          placeholder="0"
          leftDecorator={<Steth />}
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
        <DataTableRow title="Transaction cost" loading={!txCostInUsd}>
          ${txCostInUsd?.toFixed(2)}
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
