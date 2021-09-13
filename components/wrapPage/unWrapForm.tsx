import { FC, memo } from 'react';
import { parseEther } from '@ethersproject/units';
import {
  Block,
  DataTable,
  DataTableRow,
  Wsteth,
  Input,
} from '@lidofinance/lido-ui';
import { useStethByWsteth, useTxCostInUsd } from 'hooks';
import FormatToken from 'components/formatToken';
import { FormStyled, MaxButton } from './styles';

const unwrapGasLimit = 140000;

const UnWrapForm: FC = () => {
  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);
  const stethConverted = useStethByWsteth(parseEther('1'));

  return (
    <Block>
      <FormStyled action="" method="post" autoComplete="off">
        <Input
          fullwidth
          placeholder="0"
          leftDecorator={<Wsteth />}
          rightDecorator={
            <MaxButton size="xxs" variant="translucent">
              MAX
            </MaxButton>
          }
          label="Amount"
        />
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
