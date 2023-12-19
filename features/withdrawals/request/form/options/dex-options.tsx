import { BigNumber } from 'ethers';
import { TOKENS } from '@lido-sdk/constants';

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
} from './styles';

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
    link: (_, token) =>
      `https://app.openocean.finance/CLASSIC#/ETH/${token}/ETH`,
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

  return (
    <DexOptionsContainer data-testid="dexOptionContainer" {...props}>
      {initialLoading
        ? placeholder.map((_, i) => <DexOptionLoader key={i} />)
        : data?.map(({ name, toReceive, rate }) => {
            const dex = dexInfo[name];
            if (!dex || (amount.gt('0') && rate === null)) return null;
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
