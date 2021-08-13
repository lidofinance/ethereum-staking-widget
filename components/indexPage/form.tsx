import { AddressZero } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { useEthereumBalance, useSTETHContractWeb3 } from '@lido-sdk/react';
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
import { FC, memo, useCallback, useEffect } from 'react';
import { FormStyled, InputStyled } from './styles';

const StakeForm: FC = () => {
  const { active } = useWeb3();
  const eth = useEthereumBalance();

  const steth = useSTETHContractWeb3();

  const submitGasLimit = useStethSubmitGasLimit(AddressZero, {
    value: parseEther('1'),
  });

  const txCostInUsd = useTxCostInUsd(submitGasLimit);

  useEffect(() => {
    console.log(txCostInUsd);
  }, [txCostInUsd]);

  const submit = useCallback(
    async (inputValue) => {
      console.log(inputValue);
      if (steth) {
        steth.submit(AddressZero, {
          value: parseEther(inputValue),
        });
      }
    },
    [steth],
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
    </Block>
  );
};

export default memo(StakeForm);
