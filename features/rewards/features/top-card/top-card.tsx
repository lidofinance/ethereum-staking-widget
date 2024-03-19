import { FC } from 'react';
import { Block, ThemeProvider, themeDark } from '@lidofinance/lido-ui';
import { InputDescription } from 'features/rewards/components/inputDescription';
import { AddressInput } from 'features/rewards/components/addressInput';
import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { InputWrapper } from 'features/rewards/components/inputWrapper';
import { useRewardsHistory } from 'features/rewards/hooks';

const INPUT_DESC_TEXT =
  'Current balance may differ from last balance in the table due to rounding.';

export const TopCard: FC = () => {
  const { address, isAddressResolving, inputValue, setInputValue } =
    useRewardsHistory();

  return (
    <Block color="accent" style={{ padding: 0 }}>
      <InputWrapper data-testid="inputSection" color="accent">
        <ThemeProvider theme={themeDark}>
          <AddressInput
            address={address}
            inputValue={inputValue}
            handleInputChange={setInputValue}
            isAddressResolving={isAddressResolving}
          />
          <InputDescription>{INPUT_DESC_TEXT}</InputDescription>
        </ThemeProvider>
      </InputWrapper>
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </Block>
  );
};
