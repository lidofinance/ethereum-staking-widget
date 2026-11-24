import type { FC } from 'react';
import { Identicon, Skeleton, Typography } from '@lidofinance/lido-app-ui';

import { shortenHex } from '../../utils';
import { Avatar, HeaderText, HeaderWrapper } from './styles';

// the size of the title line the skeleton stands for
const TITLE_SKELETON_WIDTH = 180;
const TITLE_SKELETON_HEIGHT = 40;

type PortfolioHeaderProps = {
  address?: string;
  // the wallet may still auto-connect
  isResolving?: boolean;
};

export const PortfolioHeader: FC<PortfolioHeaderProps> = ({
  address,
  isResolving = false,
}) => (
  <HeaderWrapper data-testid={address ? 'portfolioHeader' : undefined}>
    <Avatar>{address && <Identicon address={address} size={78} />}</Avatar>
    <HeaderText>
      {isResolving ? (
        <Skeleton
          variant="text"
          width={TITLE_SKELETON_WIDTH}
          height={TITLE_SKELETON_HEIGHT}
          data-testid="portfolioHeaderSkeleton"
        />
      ) : (
        <Typography as="h2" color="default" variant="h2" title={address}>
          {address ? shortenHex(address) : 'No wallet connected'}
        </Typography>
      )}
    </HeaderText>
  </HeaderWrapper>
);
