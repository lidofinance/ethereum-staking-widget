import React, { FC, memo, useCallback, useMemo, useState } from 'react';
import {
  Block,
  DataTable,
  DataTableRow,
  Input,
  SelectIcon,
  Option,
  Eth,
  Steth,
  Button,
  Lock,
  ButtonIcon,
} from '@lidofinance/lido-ui';
import { getTokenAddress } from '@lido-sdk/constants';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHContractWeb3,
  useApprove,
} from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { parseEther } from '@ethersproject/units';
import { FormStyled, InputGroupStyled, MaxButton } from './styles';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect/walletConnect';
import { useWstethBySteth, useTxCostInUsd, useCurrencyInput } from 'hooks';
import StakeModal, { TX_STAGE } from '../indexPage/stakeModal';
import { runWithTransactionLogger } from '../../utils';

const approveGasLimit = 70000;

const iconsMap = {
  eth: <Eth />,
  steth: <Steth />,
};

const WrapForm: FC = () => {
  const { active, chainId } = useWeb3();
  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethContractWeb3 = useWSTETHContractWeb3();

  const stethTokenAddress = getTokenAddress(5, 'STETH');
  const wstethTokenAddress = getTokenAddress(5, 'WSTETH');

  const [selectedToken, setSelectedToken] =
    useState<keyof typeof iconsMap>('eth');

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStage, setTxStage] = useState(TX_STAGE.SUCCESS);
  const [txHash, setTxHash] = useState<string>();

  const wrapGasLimit = useMemo(
    () => (chainId === CHAINS.Goerli ? 180000 : 140000),
    [chainId],
  );

  const balanceBySelectedToken = useMemo(
    () => (selectedToken === 'eth' ? ethBalance.data : stethBalance.data),
    [selectedToken, ethBalance, stethBalance],
  );

  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);
  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);
  const wstethConverted = useWstethBySteth(parseEther('1'));

  const openTxModal = useCallback(() => {
    setTxModalOpen(true);
  }, []);

  const closeTxModal = useCallback(() => {
    setTxModalOpen(false);
  }, []);

  const wrapProcessing = useCallback(
    async (inputValue) => {
      if (!wstethContractWeb3) {
        return;
      }

      try {
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
      } catch (e) {
        setTxStage(TX_STAGE.FAIL);
        setTxHash(undefined);
        console.error(e);
      }
    },
    [openTxModal, wstethContractWeb3, wstethTokenAddress],
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
    submit: wrapProcessing,
    limit: balanceBySelectedToken,
  });

  const { needsApprove } = useApprove(
    parseEther(inputValue ? inputValue : '0'),
    stethTokenAddress,
    wstethTokenAddress,
  );

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
            onChange={(value) =>
              setSelectedToken(value as keyof typeof iconsMap)
            }
          >
            <Option leftDecorator={iconsMap.steth} value="steth">
              Lido (STETH)
            </Option>
            <Option leftDecorator={iconsMap.eth} value="eth">
              Ethereum (ETH)
            </Option>
          </SelectIcon>
          <Input
            fullwidth
            placeholder="0"
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
        </InputGroupStyled>
        {active ? (
          needsApprove ? (
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
        <DataTableRow title="Exchange rate" loading={!wstethConverted}>
          1 stETH =
          <FormatToken amount={wstethConverted} symbol="wstETH" />
        </DataTableRow>
        <DataTableRow title="Allowance" loading={true}></DataTableRow>
        <DataTableRow title="You will receive" loading={true}></DataTableRow>
      </DataTable>

      <StakeModal
        open={txModalOpen}
        onClose={closeTxModal}
        txStage={txStage}
        txHash={txHash}
        amount={inputValue}
        balance={balanceBySelectedToken}
      />
    </Block>
  );
};

export default memo(WrapForm);
