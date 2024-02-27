import { BigNumber } from 'ethers';

import { useWithdrawalRates } from 'features/withdrawals/request/withdrawal-rates/use-withdrawal-rates';
import { FormatToken } from 'shared/formatters/format-token';

import { trackMatomoEvent } from 'config/trackMatomoEvent';
import {
  DexOptionBlockLink,
  DexOptionBlockTitle,
  DexOptionStyled,
  DexOptionsContainer,
  DexOptionAmount,
  InlineLoaderSmall,
  DexOptionLoader,
} from './styles';

type DexOptionProps = {
  title: string;
  icon: React.FC;
  url: string;
  loading?: boolean;
  toReceive: BigNumber | null;
  onClickGoTo: React.MouseEventHandler<HTMLAnchorElement>;
};

const DexOption: React.FC<DexOptionProps> = ({
  title,
  icon: Icon,
  url,
  toReceive,
  loading,
  onClickGoTo,
}) => {
  return (
    <DexOptionStyled>
      <Icon />
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
  const { data, initialLoading, loading, amount, selectedToken, enabledDexes } =
    useWithdrawalRates();

  return (
    <DexOptionsContainer data-testid="dexOptionContainer" {...props}>
      {initialLoading &&
        enabledDexes.map((_, i) => <DexOptionLoader key={i} />)}
      {!initialLoading &&
        data?.map(({ title, toReceive, link, rate, matomoEvent, icon }) => {
          return (
            <DexOption
              title={title}
              icon={icon}
              onClickGoTo={() => trackMatomoEvent(matomoEvent)}
              url={link(amount, selectedToken)}
              key={title}
              loading={loading}
              toReceive={rate ? toReceive : null}
            />
          );
        })}
    </DexOptionsContainer>
  );
};
