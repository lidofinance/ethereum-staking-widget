import {
  FC,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useRouter } from 'next/router';

import { parseEther } from '@ethersproject/units';
import {
  useSDK,
  useContractSWR,
  useEthereumBalance,
  useSTETHBalance,
  useSTETHContractRPC,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import {
  Block,
  Button,
  DataTable,
  DataTableRow,
  Eth,
} from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'config';
import { OneinchInfo } from 'features/home/oneinch-info/oneinch-info';
import { Connect } from 'shared/wallet';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import { useTxCostInUsd } from 'shared/hooks';
import { InputDecoratorMaxButton } from 'shared/forms/components/input-decorator-max-button';
import { useCurrencyInput } from 'shared/forms/hooks/useCurrencyInput';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

import { FormStyled, InputStyled } from './styles';
import { useStethSubmitGasLimit } from './hooks';
import { useStakeableEther } from '../hooks';
import { stakeProcessing } from './utils';
import { useStakingLimitWarn } from './useStakingLimitWarn';

export const StakeForm: FC = memo(() => {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');
  const [inputValue, setInputValue] = useState('');

  // consumes amount query param
  // SSG safe
  useEffect(() => {
    if (
      router.isReady &&
      router.query.amount &&
      typeof router.query.amount === 'string'
    ) {
      const { amount, ...rest } = router.query;
      void router.replace({ pathname: router.pathname, query: rest });
      setInputValue(amount);
    }
  }, [router]);

  const { active, chainId } = useWeb3();
  const { providerWeb3 } = useSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();
  const etherBalance = useEthereumBalance(undefined, STRATEGY_LAZY);
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
    async (inputValue: string, resetForm: () => void) => {
      await stakeProcessing(
        staticRpcProvider,
        providerWeb3,
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
        isMultisig,
      );
    },
    [
      staticRpcProvider,
      providerWeb3,
      stethContractWeb3,
      openTxModal,
      stethBalance.update,
      chainId,
      router?.query?.ref,
      isMultisig,
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
    return () => {
      if (active) {
        reset();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Block>
      <FormStyled action="" method="post" onSubmit={handleSubmit} ref={formRef}>
        <InputStyled
          data-testid="stakeInput"
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
            data-testid="stakeSubmitBtn"
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
        <DataTableRow title="You will receive" data-testid="youWillReceive">
          {willReceiveStEthValue} stETH
        </DataTableRow>
        <DataTableRow title="Exchange rate" data-testid="exchangeRate">
          1 ETH = 1 stETH
        </DataTableRow>
        <DataTableRow
          title="Max transaction cost"
          data-testid="maxTxCost"
          loading={!txCostInUsd}
        >
          ${txCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow
          title="Reward fee"
          data-testid="lidoFee"
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
        onRetry={() => formRef.current?.requestSubmit()}
      />
    </Block>
  );
});
