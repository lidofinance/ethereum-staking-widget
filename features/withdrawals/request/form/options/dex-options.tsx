import { BigNumber } from 'ethers';
import { CHAINS, getTokenAddress, TOKENS } from '@lido-sdk/constants';

import { useMemo } from 'react';
import { useWithdrawalRates } from 'features/withdrawals/hooks/useWithdrawalRates';
import { FormatToken } from 'shared/formatters/format-token';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import {
  DexOptionBlockLink,
  DexOptionBlockTitle,
  DexOptionStyled,
  DexOptionsContainer,
  DexOptionAmount,
  InlineLoaderSmall,
  DexOptionLoader,
  OpenOceanIcon,
  ParaSwapIcon,
  DexWarning,
} from './styles';
import { formatEther } from '@ethersproject/units';
import { OPEN_OCEAN_REFERRAL_ADDRESS } from 'config/external-links';
// @ts-expect-error https://www.npmjs.com/package/@svgr/webpack
import { ReactComponent as AttentionTriangle } from 'assets/icons/attention-triangle.svg';

const placeholder = Array.from<null>({ length: 1 }).fill(null);

const dexInfo: {
  [key: string]: {
    title: string;
    icon: JSX.Element;
    onClickGoTo: React.MouseEventHandler<HTMLAnchorElement>;
    link: (amount: BigNumber, token: TOKENS.STETH | TOKENS.WSTETH) => string;
  };
} = {
  openOcean: {
    title: 'OpenOcean',
    icon: <OpenOceanIcon />,
    onClickGoTo: () => {
      trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToOpenOcean);
    },
    link: (amount, token) =>
      `https://app.openocean.finance/classic?referrer=${OPEN_OCEAN_REFERRAL_ADDRESS}&amount=${formatEther(
        amount,
      )}#/ETH/${token}/ETH`,
  },
  paraswap: {
    title: 'ParaSwap',
    icon: <ParaSwapIcon />,
    onClickGoTo: () => {
      trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToParaswap);
    },
    link: (amount, token) =>
      `https://app.paraswap.io/?referrer=Lido&takeSurplus=true#/${getTokenAddress(
        CHAINS.Mainnet,
        token,
      )}-0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/${formatEther(
        amount,
      )}/SELL?network=ethereum`,
  },
};

type DexOptionProps = {
  title: string;
  icon: JSX.Element;
  url: string;
  loading?: boolean;
  toReceive: BigNumber | null;
  onClickGoTo: React.MouseEventHandler<HTMLAnchorElement>;
};

const DexOption: React.FC<DexOptionProps> = ({
  title,
  icon,
  url,
  toReceive,
  loading,
  onClickGoTo,
}) => {
  return (
    <DexOptionStyled>
      {icon}
      <DexOptionBlockTitle>{title}</DexOptionBlockTitle>
      <DexOptionBlockLink
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClickGoTo}
      >
        Go to {title}
      </DexOptionBlockLink>
      <DexOptionAmount>
        {loading && !toReceive && <InlineLoaderSmall />}
        {toReceive ? (
          <FormatToken
            approx
            showAmountTip
            amount={toReceive ?? BigNumber.from(0)}
            symbol="ETH"
          />
        ) : (
          '-'
        )}
      </DexOptionAmount>
    </DexOptionStyled>
  );
};

export const DexOptions: React.FC<
  React.ComponentProps<typeof DexOptionsContainer>
> = (props) => {
  const { data, initialLoading, loading, amount, selectedToken } =
    useWithdrawalRates();

  const dexesFiltered = useMemo(() => {
    return data?.filter(({ rate, name }) => {
      const dex = dexInfo[name];
      return dex && (amount.eq('0') || rate !== null);
    });
  }, [amount, data]);

  return (
    <DexOptionsContainer data-testid="dexOptionContainer" {...props}>
      {initialLoading && placeholder.map((_, i) => <DexOptionLoader key={i} />)}
      {!initialLoading && (!dexesFiltered || dexesFiltered.length === 0) && (
        <DexWarning>
          <AttentionTriangle />
          <div>Aggregator&apos;s prices are not available now</div>
        </DexWarning>
      )}
      {!initialLoading &&
        dexesFiltered?.map(({ name, toReceive, rate }) => {
          const dex = dexInfo[name];
          return (
            <DexOption
              title={dex.title}
              icon={dex.icon}
              onClickGoTo={dex.onClickGoTo}
              url={dex.link(amount, selectedToken)}
              key={name}
              loading={loading}
              toReceive={rate ? toReceive : null}
            />
          );
        })}
    </DexOptionsContainer>
  );
};
