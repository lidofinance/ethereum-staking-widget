import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Block,
  Button,
  ButtonIcon,
  DataTable,
  DataTableRow,
  Eth,
  Input,
  Lock,
  Option,
  SelectIcon,
  Steth,
} from '@lidofinance/lido-ui';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  useSDK,
  useApprove,
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHContractWeb3,
} from '@lido-sdk/react';
import { parseEther } from '@ethersproject/units';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import TxStageModal, { TX_OPERATION, TX_STAGE } from 'components/txStageModal';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect';
import InputLocked from 'components/inputLocked';
import { useCurrencyInput, useTxCostInUsd, useWstethBySteth } from 'hooks';
import { formatBalance, runWithTransactionLogger } from 'utils';
import { FormStyled, InputGroupStyled, MaxButton } from './styles';
import { wrapProcessingWithApprove } from './processings';

const ETH = 'ETH';

const iconsMap = {
  [ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
};

const WrapForm: FC = () => {
  const { active, account } = useWeb3();
  const { chainId } = useSDK();

  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const [selectedToken, setSelectedToken] = useState<keyof typeof iconsMap>(
    TOKENS.STETH,
  );

  const [inputValue, setInputValue] = useState('');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txOperation, setTxOperation] = useState(TX_OPERATION.STAKING);
  const [txHash, setTxHash] = useState<string>();

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
    [selectedToken, ethBalance, stethBalance],
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
    ): Promise<TransactionReceipt> => {
      openTxModal();
      setTxStage(TX_STAGE.SIGN);

      const transaction = await runWithTransactionLogger(
        'Approve signing',
        callback,
      );

      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);

      const result = await runWithTransactionLogger(
        'Approve block confirmation',
        async () => transaction.wait(),
      );

      setTxStage(TX_STAGE.SUCCESS);

      return result;
    },
    [openTxModal],
  );

  const {
    approve,
    needsApprove,
    allowance,
    loading: loadingUseApprove,
  } = useApprove(
    parseEther(inputValue ? inputValue : '0'),
    stethTokenAddress,
    wstethTokenAddress,
    account ? account : undefined,
    approveWrapper,
  );

  const forWillReceiveWsteth = useMemo(() => {
    if (selectedToken === TOKENS.STETH) {
      if (needsApprove) {
        return parseEther('0');
      } else {
        return allowance;
      }
    } else {
      // It's ETH
      return parseEther(inputValue ? inputValue : '0');
    }
  }, [allowance, inputValue, needsApprove, selectedToken]);
  const willReceiveWsteth = useWstethBySteth(forWillReceiveWsteth);

  const wrapProcessing = useCallback(
    async (inputValue) => {
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
        ethBalance.update,
        stethBalance.update,
        inputValue,
        selectedToken,
        needsApprove,
        approve,
      );
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
    ],
  );

  const {
    handleSubmit,
    handleChange,
    error,
    isValidating,
    isSubmitting,
    setMaxInputValue,
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

  return (
    <Block>
      <FormStyled
        action=""
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <InputGroupStyled fullwidth>
          <SelectIcon
            icon={iconsMap[selectedToken]}
            value={selectedToken}
            onChange={onChangeSelectToken}
          >
            <Option leftDecorator={iconsMap[TOKENS.STETH]} value={TOKENS.STETH}>
              Lido (STETH)
            </Option>
            <Option leftDecorator={iconsMap[ETH]} value={ETH}>
              Ethereum (ETH)
            </Option>
          </SelectIcon>
          <Input
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
                {needsApprove && selectedToken === TOKENS.STETH ? (
                  <InputLocked />
                ) : (
                  ''
                )}
              </>
            }
            label="Amount"
            value={inputValue}
            onChange={handleChange}
            error={error}
          />
        </InputGroupStyled>
        {active ? (
          needsApprove && selectedToken === TOKENS.STETH ? (
            <ButtonIcon
              icon={<Lock />}
              fullwidth
              type="submit"
              disabled={isValidating || isSubmitting}
            >
              Unlock token to wrap
            </ButtonIcon>
          ) : (
            <Button
              fullwidth
              type="submit"
              disabled={isValidating || isSubmitting}
            >
              Wrap
            </Button>
          )
        ) : (
          <WalletConnect fullwidth />
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
          <FormatToken amount={allowance} symbol="" />
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
        amount={inputValue}
        amountToken={selectedToken === ETH ? 'ETH' : 'stETH'}
        willReceiveAmount={formatBalance(willReceiveWsteth)}
        willReceiveAmountToken="wstETH"
        balance={balanceBySelectedToken}
        balanceToken={selectedToken === ETH ? 'ETH' : 'stETH'}
      />
    </Block>
  );
};

export default memo(WrapForm);
