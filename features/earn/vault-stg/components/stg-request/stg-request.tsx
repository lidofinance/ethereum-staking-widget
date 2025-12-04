import { Button } from '@lidofinance/lido-ui';
import { FormatPrice } from 'shared/formatters/format-price';
import { LOCALE } from 'config/groups/locale';

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
import { ButtonInline } from 'shared/components/button-inline';

export { RequestsContainer, ActionableTitle } from './styles';

export type STGRequestProps = {
  tokenLogo: React.ReactNode;
  tokenAmount: bigint;
  tokenName: string;
  tokenAmountUSD?: number;
  createdDateTimestamp?: bigint;
  actionText?: string;
  actionCallback?: () => void;
  actionLoading?: boolean;
  actionButtonVariant?: 'button' | 'link-alike';
};

export const STGRequest = ({
  tokenLogo,
  tokenAmount,
  tokenName,
  tokenAmountUSD,
  createdDateTimestamp,
  actionText,
  actionCallback,
  actionLoading,
  actionButtonVariant = 'button',
}: STGRequestProps) => {
  const createdDate = createdDateTimestamp
    ? new Date(Number(createdDateTimestamp) * 1000).toLocaleDateString(LOCALE, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : undefined;

  const button =
    actionButtonVariant === 'link-alike' ? (
      <ButtonInline onClick={actionCallback} disabled={actionLoading}>
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
            />
          </AmountTokenValue>
          {tokenAmountUSD != undefined && (
            <AmountUSD>
              <FormatPrice amount={tokenAmountUSD} />
            </AmountUSD>
          )}
        </AmountContainer>
        {createdDate && <CreatedDate>created on {createdDate}</CreatedDate>}
        {actionText && button}
      </Entry>
    </RequestContainer>
  );
};
