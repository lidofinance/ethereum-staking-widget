import { Button } from '@lidofinance/lido-ui';
import { formatUnits } from 'viem';
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
  tokenAmountUSD: bigint;
  createdDateTimestamp: bigint;
  actionText?: string;
  actionCallback?: () => void;
}) => {
  const amountUSD = Number(formatUnits(tokenAmountUSD, 8));
  const createdDate = new Date(
    Number(createdDateTimestamp) * 1000,
  ).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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
            <FormatPrice amount={amountUSD} />
          </AmountUSD>
        </AmountContainer>
        <CreatedDate>created on {createdDate}</CreatedDate>
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
