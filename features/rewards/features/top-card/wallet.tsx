import { FC } from 'react';
import { ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import { InputDescription } from 'features/rewards/components/inputDescription';
import { useRewardsHistory } from 'features/rewards/hooks';

import {
  WalletStyle,
  WalletContentStyle,
  WalletContentAddressBadgeStyle,
} from './styles';

const INPUT_DESC_TEXT =
  'Current balance may differ from last balance in the table due to rounding.';

export const Wallet: FC = () => {
  const { address } = useRewardsHistory();

  return (
    <WalletStyle>
      <ThemeProvider theme={themeDark}>
        <WalletContentStyle>
          <InputDescription>{INPUT_DESC_TEXT}</InputDescription>
          <WalletContentAddressBadgeStyle
            address={address as `0x${string}`}
            symbolsMobile={6}
            symbolsDesktop={6}
          />
        </WalletContentStyle>
      </ThemeProvider>
    </WalletStyle>
  );
};
