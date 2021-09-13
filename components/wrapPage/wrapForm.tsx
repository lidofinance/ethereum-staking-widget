import { FC, memo, useMemo, useState } from 'react';
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
import { useWeb3 } from '@lido-sdk/web3-react';
import { CHAINS } from '@lido-sdk/constants';
import { parseEther } from '@ethersproject/units';
import { FormStyled, InputGroupStyled, MaxButton } from './styles';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect/walletConnect';
import { useWstethBySteth, useTxCostInUsd } from 'hooks';

const approveGasLimit = 70000;

const iconsMap = {
  eth: <Eth />,
  steth: <Steth />,
};

const WrapForm: FC = () => {
  const { active, chainId } = useWeb3();

  const wrapGasLimit = useMemo(
    () => (chainId === CHAINS.Goerli ? 180000 : 140000),
    [chainId],
  );

  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);
  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);
  const wstethConverted = useWstethBySteth(parseEther('1'));

  const [selectedToken, setSelectedToken] =
    useState<keyof typeof iconsMap>('eth');

  const needsApproval = false;

  return (
    <Block>
      <FormStyled action="" method="post" autoComplete="off">
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
            placeholder="Amount"
            rightDecorator={
              <MaxButton size="xxs" variant="translucent">
                MAX
              </MaxButton>
            }
          />
        </InputGroupStyled>
        {active ? (
          needsApproval ? (
            <ButtonIcon icon={<Lock />} fullwidth type="submit">
              Unlock token to wrap
            </ButtonIcon>
          ) : (
            <Button fullwidth type="submit">
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
    </Block>
  );
};

export default memo(WrapForm);
