import { FC } from 'react';
import { Box, ThemeProvider, themeDark } from '@lidofinance/lido-ui';

import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';
import { Title } from 'features/rewards/components/stats/Title';
import { DescriptionAboutRoundingBlock } from 'features/rewards/components/description-about-rounding-block';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useRewardsBalanceData } from 'features/rewards/hooks/use-rewards-balance-data';
import { FlexCenter } from 'features/stake/stake-form/wallet/styles';
import { CardBalance } from 'shared/wallet';

import {
  WalletStyle,
  WalletContentStyle,
  WalletContentAddressBadgeStyle,
  WalletContentRowStyle,
} from './styles';

export const Wallet: FC = () => {
  const { data: balanceData } = useRewardsBalanceData();
  const { currencyObject: currency, address, loading } = useRewardsHistory();

  return (
    <WalletStyle>
      <ThemeProvider theme={themeDark}>
        <WalletContentStyle>
          <WalletContentRowStyle>
            <CardBalance
              data-testid="stEthBalanceBlock"
              title={
                <FlexCenter>
                  <span>stETH balance</span>
                </FlexCenter>
              }
              loading={loading}
              value={
                <div data-testid="stEthBalance">
                  <EthSymbol />
                  <NumberFormat
                    number={balanceData?.stEthBalanceParsed}
                    pending={loading}
                  />
                </div>
              }
            >
              <Title data-testid="stEthBalanceIn$" hideMobile>
                <Box display="inline-block" pr="3px">
                  {currency.symbol}
                </Box>
                <NumberFormat
                  number={balanceData?.stEthCurrencyBalance}
                  currency
                  pending={loading}
                />
              </Title>
            </CardBalance>

            <WalletContentAddressBadgeStyle
              address={address as `0x${string}`}
              symbolsMobile={6}
              symbolsDesktop={12}
            />
          </WalletContentRowStyle>

          <DescriptionAboutRoundingBlock>
            Current balance may differ from last balance in the table due to
            rounding.
          </DescriptionAboutRoundingBlock>
        </WalletContentStyle>
      </ThemeProvider>
    </WalletStyle>
  );
};
