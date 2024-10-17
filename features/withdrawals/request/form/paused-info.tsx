import { useAccount } from 'wagmi';
import { Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { CHAINS } from 'consts/chains';

import { InfoBoxStyled } from 'features/withdrawals/shared';

const LIDO_TWITTER_LINK = 'https://twitter.com/lidofinance';

export const PausedInfo = () => {
  const { chainId } = useAccount();

  let link = <Link href={LIDO_TWITTER_LINK}>see here</Link>;

  if (chainId == CHAINS.Sepolia) {
    link = (
      <Link href={`${config.docsOrigin}/deployed-contracts/sepolia/`}>
        see here
      </Link>
    );
  }

  return (
    <InfoBoxStyled>
      Withdrawals are currently unavailable. For more information, {link}
    </InfoBoxStyled>
  );
};
