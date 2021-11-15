import {
  FC,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
// import { AddressZero } from '@ethersproject/constants';
// import { parseEther } from '@ethersproject/units';
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
import { Connect } from 'shared/wallet';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import { useCurrencyInput, useTxCostInUsd } from 'shared/hooks';
// import { useStethSubmitGasLimit } from './hooks/use-steth-submit-gas-limit';
import { FormStyled, InputStyled, MaxButton } from './styles';
import { stakeProcessing } from './utils';
import { parseEther } from '@ethersproject/units';

export const StakeForm: FC = memo(() => {
  const formRef = useRef<HTMLFormElement>(null);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');

  const { active } = useWeb3();
  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const stethContractWeb3 = useSTETHContractWeb3();
  const contractRpc = useSTETHContractRPC();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  // TODO: Failed to estimate gas limit
  // const submitGasLimit = useStethSubmitGasLimit(AddressZero, {
  //   value: parseEther('1'),
  // });
  const submitGasLimit = useMemo(() => 120000, []);
  const txCostInUsd = useTxCostInUsd(submitGasLimit);

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const submit = useCallback(
    async (inputValue, resetForm) => {
      await stakeProcessing(
        stethContractWeb3,
        openTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        stethBalance.update,
        inputValue,
        resetForm,
      );
    },
    [openTxModal, stethContractWeb3, stethBalance.update],
  );

  const {
    inputValue,
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
    reset,
  } = useCurrencyInput({
    submit,
    limit: ethBalance.data,
  });

  const willReceiveStEthValue = useMemo(() => {
    if (!inputValue) {
      return 0;
    }

    if (!Number(inputValue)) {
      return 0;
    }

    try {
      parseEther(inputValue);
    } catch {
      return 0;
    }

    return inputValue;
  }, [inputValue]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) {
      reset();
    }
  }, [active, reset]);

  return (
    <Block>
      <FormStyled action="" method="post" onSubmit={handleSubmit} ref={formRef}>
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
            disabled={isValidating}
            loading={isSubmitting}
          >
            Submit
          </Button>
        ) : (
          <Connect fullwidth />
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
        amountToken="ETH"
        willReceiveAmount={inputValue}
        willReceiveAmountToken="stETH"
        balance={stethBalance.data}
        balanceToken="stETH"
        failedText={txModalFailedText}
        formRef={formRef}
      />
    </Block>
  );
});
