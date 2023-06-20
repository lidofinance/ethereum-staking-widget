import {
  FC,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/router';
import { parseEther } from '@ethersproject/units';
import {
  useContractSWR,
  useEthereumBalance,
  useSTETHBalance,
  useSTETHContractRPC,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import { useWeb3 } from 'reef-knot/web3-react';
import {
  Block,
  Button,
  DataTable,
  DataTableRow,
  Eth,
} from '@lidofinance/lido-ui';
import { OneinchInfo } from 'features/home/oneinch-info/oneinch-info';
import { DATA_UNAVAILABLE } from 'config';
import { Connect } from 'shared/wallet';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import { useTxCostInUsd } from 'shared/hooks';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';
import { FormStyled, InputStyled } from './styles';
import { stakeProcessing } from './utils';
import { useStethSubmitGasLimit } from './hooks';
import { useStakeableEther } from '../hooks';
import { useStakingLimitWarn } from './useStakingLimitWarn';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';

export const StakeForm: FC = memo(() => {
  const router = useRouter();
  const initialValue = (router?.query?.amount as string) || '';

  const formRef = useRef<HTMLFormElement>(null);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');
  const [inputValue, setInputValue] = useState(() => {
    // consumes amount query param
    if (router.query.amount && typeof router.query.amount === 'string') {
      const initialValue = router.query.amount;
      delete router.query.amount;
      router.replace(
        { pathname: router.pathname, query: router.query },
        undefined,
        { shallow: true },
      );
      return initialValue;
    }
    return '';
  });

  const { active, chainId } = useWeb3();
  const etherBalance = useEthereumBalance();
  const stakeableEther = useStakeableEther();
  const stethBalance = useSTETHBalance();
  const stethContractWeb3 = useSTETHContractWeb3();
  const contractRpc = useSTETHContractRPC();
  const [isMultisig] = useIsMultisig();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  const submitGasLimit = useStethSubmitGasLimit();
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
        chainId,
        router?.query?.ref as string | undefined,
      );
    },
    [
      stethContractWeb3,
      openTxModal,
      stethBalance.update,
      chainId,
      router?.query?.ref,
    ],
  );

  const token = 'ETH';
  const inputName = `${getTokenDisplayName(token)} amount`;

  const {
    handleSubmit,
    handleChange,
    error,
    isSubmitting,
    setMaxInputValue,
    reset,
    isMaxDisabled,
  } = useCurrencyInput({
    inputValue,
    setInputValue,
    inputName,
    initialValue,
    submit,
    limit:
      etherBalance.data &&
      stakeableEther.data &&
      (stakeableEther.data.lt(etherBalance.data)
        ? stakeableEther.data
        : etherBalance.data),
    padMaxAmount: (padAmount) =>
      Boolean(
        !isMultisig &&
          etherBalance.data &&
          stakeableEther.data &&
          etherBalance.data.sub(padAmount).lte(stakeableEther.data),
      ),
    gasLimit: submitGasLimit,
  });

  const { limitWarning, limitReached } = useStakingLimitWarn();

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

    return inputValue.slice(0, 30);
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
            <InputDecoratorMaxButton
              onClick={setMaxInputValue}
              disabled={isMaxDisabled}
            />
          }
          label={inputName}
          value={inputValue}
          onChange={handleChange}
          error={error}
          warning={limitWarning}
        />
        {active ? (
          <Button
            fullwidth
            type="submit"
            disabled={limitReached || !!error}
            loading={isSubmitting}
          >
            Submit
          </Button>
        ) : (
          <Connect fullwidth />
        )}
        <OneinchInfo />
      </FormStyled>

      <DataTable>
        <DataTableRow title="You will receive">
          {willReceiveStEthValue} stETH
        </DataTableRow>
        <DataTableRow title="Exchange rate">1 ETH = 1 stETH</DataTableRow>
        <DataTableRow title="Max transaction cost" loading={!txCostInUsd}>
          ${txCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow
          title="Reward fee"
          loading={lidoFee.initialLoading}
          help="Please note: this fee applies to staking rewards only,
          and is NOT taken from your staked amount."
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
