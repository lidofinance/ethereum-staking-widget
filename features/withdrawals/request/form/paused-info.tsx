import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { CHAINS } from 'consts/chains';

import { InfoBoxStyled } from 'features/withdrawals/shared';
import { useDappStatus } from 'modules/web3';

const LIDO_TWITTER_LINK = 'https://twitter.com/lidofinance';

export const PausedInfo = () => {
  const { chainId } = useDappStatus();

  const docsSepoliaLink = `${config.docsOrigin}/deployed-contracts/sepolia/`;

  return (
    <InfoBoxStyled>
      Withdrawals are currently unavailable. For more information,{' '}
      <Link
        href={chainId == CHAINS.Sepolia ? docsSepoliaLink : LIDO_TWITTER_LINK}
      >
        see here
      </Link>
    </InfoBoxStyled>
  );
};
