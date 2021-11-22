import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  Block,
  Button,
  ButtonIcon,
  DataTable,
  DataTableRow,
  Eth,
  Lock,
  Option,
  Steth,
} from '@lidofinance/lido-ui';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  useSDK,
  useApprove,
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHBalance,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { TxStageModal, TX_OPERATION, TX_STAGE } from 'shared/components';
import {
  useCurrencyInput,
  useTxCostInUsd,
  useWstethBySteth,
} from 'shared/hooks';
import { formatBalance, runWithTransactionLogger } from 'utils';
import { Connect } from 'shared/wallet';
import { FormatToken } from 'shared/formatters';
import {
  FormStyled,
  InputGroupStyled,
  MaxButton,
  SelectIconWrapper,
  InputWrapper,
} from 'features/wrap/styles';
import { wrapProcessingWithApprove } from 'features/wrap/utils';
import { InputLocked } from 'features/wrap/components';

const ETH = 'ETH';

const iconsMap = {
  [ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
};

export const WrapForm: FC = memo(() => {
  const { active, account } = useWeb3();
  const { chainId } = useSDK();

  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const formRef = useRef<HTMLFormElement>(null);

  const [selectedToken, setSelectedToken] = useState<keyof typeof iconsMap>(
    TOKENS.STETH,
  );

  const [inputValue, setInputValue] = useState('');
  // Needs for fix flashing balance in tx success modal
  const [wrappingAmountValue, setWrappingAmountValue] = useState('');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txOperation, setTxOperation] = useState(TX_OPERATION.STAKING);
  const [txHash, setTxHash] = useState<string>();
  const [txModalFailedText, setTxModalFailedText] = useState('');

  const inputValueAsBigNumber = useMemo(() => {
    try {
      return parseEther(inputValue ? inputValue : '0');
    } catch {
      return parseEther('0');
    }
  }, [inputValue]);

  const stethTokenAddress = useMemo(
    () => getTokenAddress(chainId, TOKENS.STETH),
    [chainId],
  );

  const wstethTokenAddress = useMemo(
    () => getTokenAddress(chainId, TOKENS.WSTETH),
    [chainId],
  );

  const approveGasLimit = useMemo(() => 70000, []);
  const oneSteth = useMemo(() => parseEther('1'), []);

  const wrapGasLimit = useMemo(
    () => (chainId === CHAINS.Goerli ? 180000 : 140000),
    [chainId],
  );

  const balanceBySelectedToken = useMemo(
    () => (selectedToken === ETH ? ethBalance.data : stethBalance.data),
    [selectedToken, ethBalance.data, stethBalance.data],
  );

  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);
  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);

  const oneWstethConverted = useWstethBySteth(oneSteth);

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const approveWrapper = useCallback(
    async (
      callback: () => Promise<TransactionResponse>,
    ): Promise<TransactionReceipt | undefined> => {
      try {
        setTxStage(TX_STAGE.SIGN);
        openTxModal();

        const transaction = await runWithTransactionLogger(
          'Approve signing',
          callback,
        );

        setTxHash(transaction.hash);
        setTxStage(TX_STAGE.BLOCK);
        openTxModal();

        const result = await runWithTransactionLogger(
          'Approve block confirmation',
          async () => transaction.wait(),
        );

        setTxStage(TX_STAGE.SUCCESS);
        openTxModal();

        return result;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      } catch (error: any) {
        setTxModalFailedText(error?.message);
        setTxStage(TX_STAGE.FAIL);
        openTxModal();
      }
    },
    [openTxModal],
  );

  const {
    approve,
    needsApprove,
    allowance,
    loading: loadingUseApprove,
  } = useApprove(
    inputValueAsBigNumber,
    stethTokenAddress,
    wstethTokenAddress,
    account ? account : undefined,
    approveWrapper,
  );

  const willWrapSteth = useMemo(() => {
    if (selectedToken === TOKENS.STETH && needsApprove) {
      return parseEther('0');
    }

    return inputValueAsBigNumber;
  }, [needsApprove, selectedToken, inputValueAsBigNumber]);
  const willReceiveWsteth = useWstethBySteth(willWrapSteth);

  const wrapProcessing = useCallback(
    async (inputValue, resetForm) => {
      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue(inputValue);

      // Set operation type of transaction
      setTxOperation(
        needsApprove && selectedToken === TOKENS.STETH
          ? TX_OPERATION.APPROVING
          : TX_OPERATION.WRAPPING,
      );

      // Run approving or wrapping
      await wrapProcessingWithApprove(
        chainId,
        wstethContractWeb3,
        openTxModal,
        setTxStage,
        setTxHash,
        setTxModalFailedText,
        ethBalance.update,
        stethBalance.update,
        inputValue,
        selectedToken,
        needsApprove,
        approve,
        resetForm,
      );

      // Needs for fix flashing balance in tx success modal
      setWrappingAmountValue('');
    },
    [
      chainId,
      wstethContractWeb3,
      openTxModal,
      ethBalance.update,
      stethBalance.update,
      selectedToken,
      needsApprove,
      approve,
      setWrappingAmountValue,
    ],
  );

  const {
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
    reset,
  } = useCurrencyInput({
    submit: wrapProcessing,
    limit: balanceBySelectedToken,
    token: selectedToken,
    externalSetInputValue: setInputValue,
  });

  const onChangeSelectToken = useCallback(
    async (value) => {
      setSelectedToken(value as keyof typeof iconsMap);
      setMaxInputValue();
    },
    [setMaxInputValue],
  );

  useEffect(() => {
    if (balanceBySelectedToken) {
      setMaxInputValue();
    }
  }, [balanceBySelectedToken, setMaxInputValue]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) {
      setInputValue('');
      reset();
    }
  }, [active, reset, setInputValue]);

  return (
    <Block>
      <FormStyled
        action=""
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <InputGroupStyled fullwidth>
          <SelectIconWrapper
            icon={iconsMap[selectedToken]}
            value={selectedToken}
            onChange={onChangeSelectToken}
            error={error}
          >
            <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
              Lido (STETH)
            </Option>
            <Option leftDecorator={iconsMap[ETH]} value={ETH}>
              Ethereum (ETH)
            </Option>
          </SelectIconWrapper>
          <InputWrapper
            fullwidth
            placeholder="0"
            rightDecorator={
              <>
                <MaxButton
                  size="xxs"
                  variant="translucent"
                  onClick={() => {
                    setMaxInputValue();
                  }}
                >
                  MAX
                </MaxButton>
                {account && needsApprove && selectedToken === TOKENS.STETH ? (
                  <InputLocked />
                ) : (
                  ''
                )}
              </>
            }
            label="Amount"
            value={inputValue}
            onChange={handleChange}
            error={!!error}
          />
        </InputGroupStyled>
        {active ? (
          needsApprove && selectedToken === TOKENS.STETH ? (
            <ButtonIcon
              icon={<Lock />}
              fullwidth
              type="submit"
              disabled={isValidating}
              loading={isSubmitting}
            >
              Unlock token to wrap
            </ButtonIcon>
          ) : (
            <Button
              fullwidth
              type="submit"
              disabled={isValidating}
              loading={isSubmitting}
            >
              Wrap
            </Button>
          )
        ) : (
          <Connect fullwidth />
        )}
      </FormStyled>

      <DataTable>
        <DataTableRow title="Unlock fee" loading={!approveTxCostInUsd}>
          ${approveTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Gas fee" loading={!wrapTxCostInUsd}>
          ${wrapTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Exchange rate" loading={!oneWstethConverted}>
          1 stETH =
          <FormatToken amount={oneWstethConverted} symbol="wstETH" />
        </DataTableRow>
        <DataTableRow title="Allowance" loading={loadingUseApprove}>
          {selectedToken === TOKENS.STETH ? (
            <FormatToken amount={allowance} symbol="stETH" />
          ) : (
            <>0.0</>
          )}
        </DataTableRow>
        <DataTableRow title="You will receive">
          <FormatToken amount={willReceiveWsteth} symbol="wstETH" />
        </DataTableRow>
      </DataTable>

      <TxStageModal
        open={txModalOpen}
        onClose={closeTxModal}
        txStage={txStage}
        txOperation={txOperation}
        txHash={txHash}
        amount={wrappingAmountValue}
        amountToken={selectedToken === ETH ? 'ETH' : 'stETH'}
        willReceiveAmount={formatBalance(willReceiveWsteth)}
        willReceiveAmountToken="wstETH"
        balance={wstethBalance.data}
        balanceToken={'wstETH'}
        allowanceAmount={allowance}
        failedText={txModalFailedText}
        formRef={formRef}
      />
    </Block>
  );
});
