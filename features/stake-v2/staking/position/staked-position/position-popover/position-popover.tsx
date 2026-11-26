import {
  Body,
  Button,
  Caption,
  Description,
  Divider,
  H3,
  LinkProvider,
  type LinkComponent,
} from '@lidofinance/lido-app-ui';

import { useConfig } from 'config';
import { PORTFOLIO_PATH } from 'consts/urls';
import {
  getPrettyChainName,
  type CrossStakingChainPosition,
  type CrossStakingChainPositionToken,
} from 'modules/web3';
import { LocalLink } from 'shared/components/local-link';
import { FormatPrice, FormatToken } from 'shared/formatters';
import { formatBalance } from 'utils';

import { TokenChainIcon } from '../../../../utils';

import {
  AssetRow,
  AssetsList,
  AssetsOverline,
  PopoverContent,
  Summary,
  SummaryAmount,
} from './styles';

// keeps ref/embed/product query params and IPFS routing on navigation
const PortfolioLink: LinkComponent = ({ ref, ...props }) => (
  <LocalLink {...props} />
);

type AssetProps = {
  token: CrossStakingChainPositionToken;
};

const Asset = ({ token }: AssetProps) => (
  <AssetRow
    leading={
      <TokenChainIcon token={token.tokenLabel} chainId={token.chainId} />
    }
    end={
      <>
        <Body weight="semibold">{formatBalance(token.balance).trimmed}</Body>
        <Description color="secondary">
          <FormatPrice amount={token.usdValue} />
        </Description>
      </>
    }
  >
    <Body weight="semibold">{token.tokenLabel}</Body>
    <Description color="secondary">
      {getPrettyChainName(token.chainId)}
    </Description>
  </AssetRow>
);

type PositionPopoverProps = {
  position?: CrossStakingChainPosition;
};

export const PositionPopover = ({ position }: PositionPopoverProps) => {
  const { externalConfig } = useConfig();
  const isPortfolioDisabled =
    externalConfig.pages[PORTFOLIO_PATH]?.shouldDisable ?? false;

  if (!position) return null;

  const assets = position.tokens.filter(({ balance }) => balance > 0n);

  return (
    <PopoverContent>
      <Summary>
        <Caption color="tertiary">Staked position</Caption>
        <SummaryAmount>
          <H3 as="span">
            <FormatToken amount={position.totalEthValue} symbol="ETH" />
          </H3>
          <Description as="span" color="secondary">
            <FormatPrice amount={position.totalUsdValue} />
          </Description>
        </SummaryAmount>
      </Summary>
      <Divider />
      <AssetsList
        divided={false}
        overline={<AssetsOverline>Staked assets</AssetsOverline>}
      >
        {assets.map((token) => (
          <Asset key={`${token.chainId}-${token.token}`} token={token} />
        ))}
      </AssetsList>
      {!isPortfolioDisabled && (
        <LinkProvider component={PortfolioLink}>
          <Button
            variant="outline"
            size="small"
            fullWidth
            href={PORTFOLIO_PATH}
          >
            View portfolio
          </Button>
        </LinkProvider>
      )}
    </PopoverContent>
  );
};
