import { FC, memo, useMemo } from 'react';
import { Block, DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useWeb3 } from '@lido-sdk/web3-react';
import { CHAINS } from '@lido-sdk/constants';
import { parseEther } from '@ethersproject/units';
import { FormStyled } from './styles';
import FormatToken from 'components/formatToken';
import { useWstethBySteth, useTxCostInUsd } from 'hooks';

const approveGasLimit = 70000;

const WrapForm: FC = () => {
  const { chainId } = useWeb3();

  const wrapGasLimit = useMemo(
    () => (chainId === CHAINS.Goerli ? 180000 : 140000),
    [chainId],
  );

  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);
  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);
  const wstethConverted = useWstethBySteth(parseEther('1'));

  return (
    <Block>
      <FormStyled action="" method="post" autoComplete="off">
        Wrap
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
