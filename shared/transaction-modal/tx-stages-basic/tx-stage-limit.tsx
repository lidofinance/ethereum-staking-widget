import { use1inchDeepLinkProps } from 'features/stake/hooks';

import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { ButtonLinkSmall, RetryButton, Grid } from './styles';

import { StageIconLimit } from './icons';
import { ErrorMessage } from 'utils';

type TxStageLimitProps = {
  failedText?: string | null;
  onRetry: React.MouseEventHandler<HTMLButtonElement>;
};

export const TxStageLimit = ({ failedText, onRetry }: TxStageLimitProps) => {
  const oneInchLinkProps = use1inchDeepLinkProps();

  return (
    <TransactionModalContent
      icon={<StageIconLimit />}
      title="Stake limit exhausted"
      description={failedText ?? 'Something went wrong'}
      footer={
        failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
          <Grid>
            <RetryButton color="secondary" onClick={onRetry} size="xs">
              Retry
            </RetryButton>
            <ButtonLinkSmall {...oneInchLinkProps}>
              Swap on 1inch
            </ButtonLinkSmall>
          </Grid>
        )
      }
    />
  );
};
