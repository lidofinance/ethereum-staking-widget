import { useEthereumBalance } from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { Block, Button, Steth } from '@lidofinance/lido-ui';
import WalletConnect from 'components/walletConnect/walletConnect';
import { useCurrencyInput } from 'hooks';
import { FC, memo, useCallback } from 'react';
import { sleep } from 'utils';
import { InputStyled } from './styles';

const StakeForm: FC = () => {
  const { active } = useWeb3();
  const eth = useEthereumBalance();

  const submit = useCallback(async (inputValue) => {
    await sleep(3000);
    console.log(inputValue);
  }, []);

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
      <form action="" method="post" onSubmit={handleSubmit}>
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
      </form>
    </Block>
  );
};

export default memo(StakeForm);
