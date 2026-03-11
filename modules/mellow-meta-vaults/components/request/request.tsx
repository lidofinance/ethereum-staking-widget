import { Button } from '@lidofinance/lido-ui';
import { FormatPrice } from 'shared/formatters/format-price';

import {
  RequestContainer,
  AmountContainer,
  AmountUSD,
  AmountTokenValue,
  CreatedDate,
  Entry,
  TokenLogo,
  ActionContainer,
} from './styles';
import { FormatToken } from 'shared/formatters';
import { ButtonInline } from 'shared/components/button-inline';
import { getTokenDecimals } from 'utils/token-decimals';
import { formatBlockchainTimestamp } from 'utils/format-blockchain-timestamp';
import { TokenSymbol } from 'consts/tokens';

export { RequestsContainer, ActionableTitle } from './styles';

export type RequestProps = {
  tokenLogo: React.ReactNode;
  tokenAmount: bigint;
  tokenName: TokenSymbol;
  tokenAmountUSD?: number;
  createdDateTimestamp?: bigint;
  actionText?: string;
  actionCallback?: () => void;
  actionLoading?: boolean;
  actionButtonVariant?: 'button' | 'link-alike';
};

export const Request = ({
  tokenLogo,
  tokenAmount,
  tokenName,
  tokenAmountUSD,
  createdDateTimestamp,
  actionText,
  actionCallback,
  actionLoading,
  actionButtonVariant = 'button',
}: RequestProps) => {
  const createdDate = createdDateTimestamp
    ? formatBlockchainTimestamp(createdDateTimestamp, { locale: 'en-GB' }) // TODO: ensure that we should use 'en-GB' instead of default 'en-US'
    : undefined;

  const button =
    actionButtonVariant === 'link-alike' ? (
      <ButtonInline
        $variant="small"
        onClick={actionCallback}
        disabled={actionLoading}
        style={{ textAlign: 'right' }}
      >
        {actionText}
      </ButtonInline>
    ) : (
      <Button
        color="primary"
        size="xs"
        variant="translucent"
        onClick={actionCallback}
        loading={actionLoading}
      >
        {actionText}
      </Button>
    );

  return (
    <RequestContainer>
      <Entry>
        <TokenLogo>{tokenLogo}</TokenLogo>
        <AmountContainer>
          <AmountTokenValue>
            <FormatToken
              amount={tokenAmount}
              symbol={tokenName}
              maxDecimalDigits={5}
              decimals={getTokenDecimals(tokenName)}
            />
          </AmountTokenValue>
          {tokenAmountUSD != undefined && (
            <AmountUSD>
              <FormatPrice amount={tokenAmountUSD} />
            </AmountUSD>
          )}
        </AmountContainer>
        <ActionContainer>
          {createdDate && <CreatedDate>{createdDate}</CreatedDate>}
          {actionText && button}
        </ActionContainer>
      </Entry>
    </RequestContainer>
  );
};
