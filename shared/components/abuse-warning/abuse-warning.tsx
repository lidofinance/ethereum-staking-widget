import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { AbuseWarningStyle, AbuseText } from './styles';
import WarningIcon from 'assets/icons/warning.svg';

export const AbuseWarning: FC = (props) => (
  <AbuseWarningStyle {...props}>
    <WarningIcon />
    <AbuseText>
      Cycle staking and re-staking liquidity from curve pool{' '}
      <Link href="https://blog.lido.fi/referral-program-1st-period/#abuse-cases">
        <u>won&apos;t be rewarded</u>
      </Link>
      .
    </AbuseText>
  </AbuseWarningStyle>
);
