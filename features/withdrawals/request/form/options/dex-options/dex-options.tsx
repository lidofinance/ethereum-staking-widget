import { BigNumber } from 'ethers';

import { useWithdrawalRates } from 'features/withdrawals/request/withdrawal-rates/use-withdrawal-rates';
import { FormatToken } from 'shared/formatters/format-token';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import {
  DexOptionBlockLink,
  DexOptionBlockTitle,
  DexOptionStyled,
  DexOptionsContainer,
  DexOptionAmount,
  DexOptionLoader,
  DexWarning,
  DexOptionsShowMore,
  DexOptionsCheckMarkIcon,
} from './styles';
import { ReactComponent as AttentionTriangle } from 'assets/icons/attention-triangle.svg';
import { useState } from 'react';
import { InlineLoaderSmall } from '../styles';

const MAX_SHOWN_ELEMENTS = 3;

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
  let amountComponent: React.ReactNode = '-';
  if (loading) {
    amountComponent = <InlineLoaderSmall />;
  } else if (toReceive) {
    amountComponent = (
      <FormatToken
        approx
        amount={toReceive ?? BigNumber.from(0)}
        symbol="ETH"
      />
    );
  }

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
      <DexOptionAmount>{amountComponent}</DexOptionAmount>
    </DexOptionStyled>
  );
};

export const DexOptions: React.FC<
  React.ComponentProps<typeof DexOptionsContainer>
> = (props) => {
  const [showMore, setShowMore] = useState(false);
  const [buttonText, setButtonText] = useState('See all options');
  const { data, initialLoading, amount, selectedToken, enabledDexes } =
    useWithdrawalRates();

  const isAnyDexEnabled = enabledDexes.length > 0;
  const allowExpand = enabledDexes.length > MAX_SHOWN_ELEMENTS;

  return (
    <>
      <DexOptionsContainer
        data-testid="dexOptionContainer"
        $maxElements={showMore ? enabledDexes.length : MAX_SHOWN_ELEMENTS}
        onTransitionEnd={() =>
          setButtonText(showMore ? 'Hide' : 'See all options')
        }
        {...props}
      >
        {!isAnyDexEnabled && (
          <DexWarning>
            <AttentionTriangle />
            <div>Aggregator&apos;s prices are not available now</div>
          </DexWarning>
        )}
        {isAnyDexEnabled &&
          initialLoading &&
          enabledDexes.map((_, i) => <DexOptionLoader key={i} />)}
        {isAnyDexEnabled &&
          !initialLoading &&
          data?.map(({ title, toReceive, link, rate, matomoEvent, icon }) => {
            return (
              <DexOption
                title={title}
                icon={icon}
                onClickGoTo={() => trackMatomoEvent(matomoEvent)}
                url={link(amount, selectedToken)}
                key={title}
                toReceive={rate ? toReceive : null}
              />
            );
          })}
      </DexOptionsContainer>
      {allowExpand && (
        <DexOptionsShowMore
          onClick={(e) => {
            e.preventDefault();
            setShowMore(!showMore);
          }}
        >
          {buttonText}
          <DexOptionsCheckMarkIcon $active={showMore} />
        </DexOptionsShowMore>
      )}
    </>
  );
};
