import { InfoBoxStyled } from 'features/withdrawals/shared';
import { Link } from '@lidofinance/lido-ui';

const LIDO_TWITTER_LINK = 'https://twitter.com/lidofinance';

export const PausedInfo = () => {
  return (
    <InfoBoxStyled>
      Withdrawals are currently unavailable. For more information,{' '}
      <Link href={LIDO_TWITTER_LINK}>see here</Link>
    </InfoBoxStyled>
  );
};
