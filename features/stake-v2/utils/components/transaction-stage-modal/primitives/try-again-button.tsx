import { TextLink } from '@lidofinance/lido-app-ui';

export type TryAgainButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

/** a link-styled button (TextLink without href) that retries the failed step */
export const TryAgainButton = ({ onClick, disabled }: TryAgainButtonProps) => (
  <TextLink onClick={onClick} disabled={disabled}>
    Try again
  </TextLink>
);
