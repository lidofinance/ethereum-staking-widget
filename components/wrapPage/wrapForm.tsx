import React, {
  FC,
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
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
import TxStageModal, { TX_STAGE, TX_OPERATION } from 'components/txStageModal';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect';
import InputLocked from 'components/inputLocked';
import { useCurrencyInput, useTxCostInUsd, useWstethBySteth } from 'hooks';
import { runWithTransactionLogger } from 'utils';
import { FormStyled, InputGroupStyled, MaxButton } from './styles';

const ETH = 'ETH';

const iconsMap = {
  [ETH]: <Eth />,
  [TOKENS.STETH]: <Steth />,
};

const WrapForm: FC = () => {
  const { active, chainId, account } = useWeb3();
  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const stethTokenAddress = getTokenAddress(5, TOKENS.STETH);
  const wstethTokenAddress = getTokenAddress(5, TOKENS.WSTETH);

  const [selectedToken, setSelectedToken] =
    useState<keyof typeof iconsMap>(ETH);

  const [inputValue, setInputValue] = useState('0');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();

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
        'Wrap signing',
        callback,
      );

      setTxHash(transaction.hash);
      setTxStage(TX_STAGE.BLOCK);

      const result = await runWithTransactionLogger(
        'Wrap block confirmation',
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
      // ETH
      return parseEther(inputValue ? inputValue : '0');
    }
  }, [allowance, inputValue, needsApprove, selectedToken]);
  const willReceiveWsteth = useWstethBySteth(forWillReceiveWsteth);

  const wrapProcessing = useCallback(
    async (inputValue) => {
      if (!wstethContractWeb3) {
        return;
      }

      try {
        if (selectedToken === ETH) {
          const callback = () =>
            wstethContractWeb3.signer.sendTransaction({
              to: wstethTokenAddress,
              value: parseEther(inputValue),
            });

          openTxModal();
          setTxStage(TX_STAGE.SIGN);

          const transaction = await runWithTransactionLogger(
            'Wrap signing',
            callback,
          );

          setTxHash(transaction.hash);
          setTxStage(TX_STAGE.BLOCK);

          await runWithTransactionLogger('Wrap block confirmation', async () =>
            transaction.wait(),
          );

          setTxStage(TX_STAGE.SUCCESS);
          return;
        }

        if (selectedToken === TOKENS.STETH) {
          if (needsApprove) {
            await approve();
          } else {
            const callback = () =>
              wstethContractWeb3.wrap(parseEther(inputValue));

            openTxModal();
            setTxStage(TX_STAGE.SIGN);

            const transaction = await runWithTransactionLogger(
              'Wrap signing',
              callback,
            );

            setTxHash(transaction.hash);
            setTxStage(TX_STAGE.BLOCK);

            await runWithTransactionLogger(
              'Wrap block confirmation',
              async () => transaction.wait(),
            );

            setTxStage(TX_STAGE.SUCCESS);
          }
        }
      } catch (e) {
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        console.error(e);
      }
    },
    [
      wstethContractWeb3,
      selectedToken,
      openTxModal,
      wstethTokenAddress,
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
    setMaxInputValue();
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
        txOperation={TX_OPERATION.UNWRAPPING}
        txHash={txHash}
        amount={inputValue}
        balance={balanceBySelectedToken}
      />
    </Block>
  );
};

export default memo(WrapForm);
