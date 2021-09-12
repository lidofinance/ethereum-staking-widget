import { FC, memo } from 'react';
import { parseEther } from '@ethersproject/units';
import { Block, DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useStethByWsteth, useTxCostInUsd } from 'hooks';
import FormatToken from 'components/formatToken';
import { FormStyled } from './styles';

const unwrapGasLimit = 140000;

const UnWrapForm: FC = () => {
  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);
  const stethConverted = useStethByWsteth(parseEther('1'));

  return (
    <Block>
      <FormStyled action="" method="post" autoComplete="off">
        UnWrap
      </FormStyled>

      <DataTable>
        <DataTableRow title="Gas fee" loading={!unwrapTxCostInUsd}>
          ${unwrapTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Exchange rate" loading={!stethConverted}>
          1 wstETH =
          <FormatToken amount={stethConverted} symbol="stETH" />
        </DataTableRow>
      </DataTable>
    </Block>
  );
};

export default memo(UnWrapForm);
