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
} from './styles';
import { FormatToken } from 'shared/formatters';

export { RequestsContainer, ActionableTitle } from './styles';

export const Request = ({
  tokenLogo,
  tokenAmount,
  tokenName,
  tokenAmountUSD,
  createdDateTimestamp,
  actionText,
  actionCallback,
}: {
  tokenLogo: React.ReactNode;
  tokenAmount: bigint;
  tokenName: string;
  tokenAmountUSD: number;
  createdDateTimestamp?: bigint;
  actionText?: string;
  actionCallback?: () => void;
}) => {
  const createdDate = createdDateTimestamp
    ? new Date(Number(createdDateTimestamp) * 1000).toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      )
    : undefined;

  return (
    <RequestContainer>
      <Entry>
        <TokenLogo>{tokenLogo}</TokenLogo>
        <AmountContainer>
          <AmountTokenValue>
            <FormatToken
              fallback="-"
              amount={tokenAmount}
              symbol={tokenName}
              maxDecimalDigits={5}
            />
          </AmountTokenValue>
          <AmountUSD>
            <FormatPrice amount={tokenAmountUSD} />
          </AmountUSD>
        </AmountContainer>
        {createdDate && <CreatedDate>created on {createdDate}</CreatedDate>}
        {actionText && (
          <Button
            color="primary"
            size="xs"
            variant="translucent"
            onClick={actionCallback}
          >
            {actionText}
          </Button>
        )}
      </Entry>
    </RequestContainer>
  );
};
