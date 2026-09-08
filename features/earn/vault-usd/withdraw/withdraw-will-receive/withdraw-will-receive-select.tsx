import { useMemo } from 'react';
import { useController, useFormState, useWatch } from 'react-hook-form';
import { Option, OptionValue } from '@lidofinance/lido-ui';

import { CHAINS } from 'consts/chains';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo';
import { getContractAddress } from 'config/networks/contract-address';
import { getTokenIcon } from 'utils/get-token-icon';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { USD_VAULT_WITHDRAW_TOKENS } from '../../consts';
import { USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES } from '../../contracts';
import { asUsdWithdrawToken } from '../../utils';
import type { UsdWithdrawToken, UsdWithdrawTokenSymbol } from '../../types';
import type { UsdVaultWithdrawFormValues } from '../form-context/types';
import { useUsdVaultPreviewWithdraw } from '../hooks/use-preview-withdraw';
import { getWillReceiveOptionLabel } from '../utils';
import { WillReceiveSelectStyle, WillReceiveTokenIcon } from './styles';

const renderTokenIcon = (token: UsdWithdrawToken | UsdWithdrawTokenSymbol) => (
  <WillReceiveTokenIcon>{getTokenIcon(token)}</WillReceiveTokenIcon>
);

const MATOMO_EVENTS: Record<UsdWithdrawToken, MATOMO_EARN_EVENTS_TYPES> = {
  [TOKENS.usdc]: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalSelectTokenUsdc,
  [TOKENS.usdt]: MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalSelectTokenUsdt,
};

// A payout token with no configured redeem queue is not offered.
const getAvailableTokens = () =>
  USD_VAULT_WITHDRAW_TOKENS.filter((token) =>
    Boolean(
      getContractAddress(
        CHAINS.Mainnet,
        USD_ASYNC_REDEEM_QUEUE_CONTRACT_NAMES[token],
      ),
    ),
  );

export const UsdVaultWithdrawWillReceiveSelect = () => {
  const availableTokens = useMemo(getAvailableTokens, []);

  const { field } = useController<UsdVaultWithdrawFormValues, 'token'>({
    name: 'token',
  });
  const { disabled } = useFormState();
  const amount = useWatch<UsdVaultWithdrawFormValues, 'amount'>({
    name: 'amount',
  });

  const usdcPreview = useUsdVaultPreviewWithdraw({
    shares: amount,
    token: TOKENS.usdc,
  });
  const usdtPreview = useUsdVaultPreviewWithdraw({
    shares: amount,
    token: TOKENS.usdt,
  });

  const assetsByToken: Record<UsdWithdrawToken, bigint | undefined> = {
    [TOKENS.usdc]: usdcPreview.isLoading ? undefined : usdcPreview.data.assets,
    [TOKENS.usdt]: usdtPreview.isLoading ? undefined : usdtPreview.data.assets,
  };

  return (
    <WillReceiveSelectStyle
      {...field}
      disabled={disabled}
      fullwidth
      arrow="small"
      leftDecorator={renderTokenIcon(field.value)}
      data-testid="will-receive-token-select"
      onChange={(value: OptionValue) => {
        // Only the payout token changes — the entered earnUSD amount is kept.
        field.onChange(value);
        trackMatomoEvent(
          MATOMO_EVENTS[asUsdWithdrawToken(value as UsdWithdrawTokenSymbol)],
        );
      }}
    >
      {availableTokens.map((token) => {
        const symbol = TOKEN_SYMBOLS[token];
        return (
          <Option
            key={token}
            value={symbol}
            leftDecorator={renderTokenIcon(token)}
            data-testid={symbol}
          >
            {getWillReceiveOptionLabel({
              assets: assetsByToken[token],
              symbol,
            })}
          </Option>
        );
      })}
    </WillReceiveSelectStyle>
  );
};
