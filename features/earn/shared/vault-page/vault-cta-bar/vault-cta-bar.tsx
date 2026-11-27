import { Button, Skeleton, Typography } from '@lidofinance/lido-app-ui';

import { FormatPercent } from 'shared/formatters/format-percent';

import { Bar, BarText } from './styles';

type VaultCtaBarProps = {
  title: string;
  apx?: number | null;
  isApxLoading?: boolean;
  visible: boolean;
  onDepositClick: () => void;
};

type BarApyProps = Pick<VaultCtaBarProps, 'apx' | 'isApxLoading'>;

// No update tooltip here, unlike VaultApxValue: the bar is too small for it.
const BarApy = ({ apx, isApxLoading }: BarApyProps) =>
  isApxLoading ? (
    <Skeleton variant="text" width="5em" />
  ) : (
    <>
      <FormatPercent value={apx} decimals="percent" /> APY
    </>
  );

// Floating bar on tablets and phones; it brings the user back to the deposit form
export const VaultCtaBar = ({
  title,
  apx,
  isApxLoading,
  visible,
  onDepositClick,
}: VaultCtaBarProps) => (
  <Bar $visible={visible} aria-hidden={!visible} data-testid="vault-cta-bar">
    <BarText>
      <Typography as="span" variant="body" weight="semibold">
        {title}
      </Typography>
      <Typography as="span" variant="body" color="tertiary">
        <BarApy apx={apx} isApxLoading={isApxLoading} />
      </Typography>
    </BarText>
    <Button
      size="small"
      onClick={onDepositClick}
      tabIndex={visible ? undefined : -1}
    >
      Deposit
    </Button>
  </Bar>
);
