import type { FC } from 'react';
import { Button, Divider, Typography } from '@lidofinance/lido-app-ui';

import { useConnectWallet } from 'shared/wallet';

import { OTHER_COLOR } from '../../consts';
import type { PortfolioRow, PortfolioSummary as Summary } from '../../types';
import { AssetsTable } from '../assets-table';
import { PortfolioSummary } from '../portfolio-summary';
import { NotConnectedWrapper, Overlay, OverlayText, Preview } from './styles';

const sampleRow = (
  key: string,
  name: string,
  symbol: string,
  valueUsd: number,
): PortfolioRow => ({
  key,
  name,
  symbol,
  amount: null,
  decimals: 18,
  valueUsd,
  apr: null,
  rewardsUsd: null,
  rewardsAmount: null,
  rewardsSymbol: null,
  chains: [
    {
      slug: 'ethereum',
      name: 'Ethereum',
      address: null,
      isNative: false,
      amount: null,
      decimals: 18,
      amountFloat: null,
      valueUsd,
    },
  ],
});

// placeholder figures only, never a real wallet
const SAMPLE_ROWS = [
  sampleRow('eth', 'Ether', 'ETH', 3200),
  sampleRow('btc', 'Bitcoin', 'BTC', 2900),
  sampleRow('usdc', 'USD Coin', 'USDC', 1500),
  sampleRow('usdt', 'Tether USD', 'USDT', 1200),
  sampleRow('dot', 'Polkadot', 'DOT', 700),
];

const SAMPLE_SUMMARY: Summary = {
  netWorthUsd: 9500,
  lidoUsd: 0,
  otherUsd: 9500,
  rewardsUsd: null,
  lidoShare: 0,
  otherShare: 1,
};

export const PortfolioNotConnected: FC = () => {
  const { isWalletConnectionAllowed, handleConnect } = useConnectWallet();

  return (
    <NotConnectedWrapper data-testid="portfolioNotConnected">
      <Preview aria-hidden>
        <PortfolioSummary summary={SAMPLE_SUMMARY} isLoading={false} />
        <Divider />
        <AssetsTable
          title="Other holdings"
          share={1}
          shareColor={OTHER_COLOR}
          totalUsd={SAMPLE_SUMMARY.otherUsd}
          rows={SAMPLE_ROWS}
          isLoading={false}
          emptyText=""
          dataTestId="portfolioPreview"
          collapsible={false}
        />
      </Preview>
      <Overlay>
        <OverlayText>
          <Typography as="p" variant="h3" color="default">
            Discover opportunities for your assets
          </Typography>
          <Typography variant="bodyLarge" color="secondary">
            Connect your wallet to continue
          </Typography>
        </OverlayText>
        <Button
          size="big"
          disabled={!isWalletConnectionAllowed}
          onClick={handleConnect}
          data-testid="connectBtn"
        >
          Connect wallet
        </Button>
      </Overlay>
    </NotConnectedWrapper>
  );
};
