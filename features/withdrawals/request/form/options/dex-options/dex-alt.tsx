import { LiFiWidgetLight, WidgetLightConfig } from '@lifi/widget-light';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useEthereumIframeHandler } from '@lifi/widget-light/ethereum';
import { getTokenAddress } from 'config/networks/token-address';
import { CHAINS } from 'consts/chains';
import { RequestFormInputType } from 'features/withdrawals/request/request-form-context';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useTheme } from 'styled-components';
import { formatEther } from 'viem';

const WIDGET_URL = 'https://widget.li.fi';
const WIDGET_ORIGIN = new URL(WIDGET_URL).origin;

const widgetConfig: WidgetLightConfig = {
  integrator: 'lido',
  variant: 'wide',
  theme: {
    container: {
      border: '1px solid rgb(234, 234, 234)',
      borderRadius: '16px',
      height: 'fit-content',
    },
  },
  sdkConfig: {
    routeOptions: {
      maxPriceImpact: 0.4,
    },
  },
  fromChain: CHAINS.Mainnet,
  toChain: CHAINS.Mainnet,
};

export const DexAlt = () => {
  const ethHandler = useEthereumIframeHandler();
  const handlers = useMemo(() => [ethHandler], [ethHandler]);
  const [token, amount] = useWatch<RequestFormInputType, ['token', 'amount']>({
    name: ['token', 'amount'],
  });

  const theme = useTheme();
  const widgetConfigComputed = useMemo(() => {
    return {
      ...widgetConfig,
      fromToken: getTokenAddress(CHAINS.Mainnet, token),
      fromAmount: amount ? formatEther(amount) : undefined,
      toToken: getTokenAddress(CHAINS.Mainnet, 'ETH'),
      appearance: theme.name === 'dark' ? 'dark' : 'light',
    };
  }, [token, amount, theme.name]);
  return (
    <LiFiWidgetLight
      src={WIDGET_URL}
      style={{
        width: '100%',
      }}
      config={widgetConfigComputed}
      handlers={handlers}
      iframeOrigin={WIDGET_ORIGIN}
      title="LI.FI Widget"
    />
  );
};
