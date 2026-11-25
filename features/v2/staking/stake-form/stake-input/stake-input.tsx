import { DataListRow } from '@lidofinance/lido-app-ui';
import { WrapperCard, FullWidthInput, DataListStyled } from './styles';

export const StakeInput = () => {
  return (
    <WrapperCard>
      <FullWidthInput
        label="Stake amount"
        secondaryValue="$0"
        balance="111"
        showMaxButton
      />
      <DataListStyled>
        <DataListRow label="Recieve" info="TODO" value={'STETH'} />
      </DataListStyled>
    </WrapperCard>
  );
};
