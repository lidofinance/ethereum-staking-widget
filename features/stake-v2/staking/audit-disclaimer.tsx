import { Typography } from '@lidofinance/lido-app-ui';
import { InlineShieldIcon } from './styles';

export const AuditDisclaimer = () => {
  return (
    <Typography variant="description" color="tertiary">
      <InlineShieldIcon />
      Non-custodial. Audited. Open-source.
    </Typography>
  );
};
