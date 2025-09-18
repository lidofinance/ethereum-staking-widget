import { Button } from '@lidofinance/lido-ui';
import {
  Container,
  AmountContainer,
  AmountUSD,
  AmountTokenValue,
  CreatedDate,
  Entry,
  Title,
  TokenLogo,
} from './styles';

export const STGPendingAction = ({
  title,
  tokenLogo,
  tokenAmount,
  tokenName,
  tokenAmountUSD,
  createdDate,
  actionText,
  actionCallback,
}: {
  title: string;
  tokenLogo: React.ReactNode;
  tokenAmount: string;
  tokenName: string;
  tokenAmountUSD: string;
  createdDate: string;
  actionText: string;
  actionCallback: () => void;
}) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Entry>
        <TokenLogo>{tokenLogo}</TokenLogo>
        <AmountContainer>
          <AmountTokenValue>
            {tokenAmount} {tokenName}
          </AmountTokenValue>
          <AmountUSD>{tokenAmountUSD}</AmountUSD>
        </AmountContainer>
        <CreatedDate>created on {createdDate}</CreatedDate>
        <Button
          color="primary"
          size="xs"
          variant="translucent"
          onClick={actionCallback}
        >
          {actionText}
        </Button>
      </Entry>
    </Container>
  );
};
