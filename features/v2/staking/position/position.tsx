import { Body } from '@lidofinance/lido-app-ui';
import { useCrossStakingChainPosition, useDappStatus } from 'modules/web3';
import { FormatPercent, FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';

import { useDelayedShow } from '../../utils';
import { Loader } from 'features/v2/utils/loader';

import {
  BorderedCard,
  PositionGrid,
  PositionTitle,
  PositionAPR,
  PositionAmount,
  UnconnectedText,
} from './styles';

const UnconnectedPosition = () => {
  const { isWalletResolving } = useDappStatus();
  const { data, isLoading } = useLidoApr();
  // isWalletResolving also has timeout but much larger,
  // useDelayedShow still UI protects against flashing apr skelton
  const shouldShow = useDelayedShow([isLoading]) && !isWalletResolving;

  const apr = data?.data?.smaApr;

  return (
    <BorderedCard>
      <UnconnectedText $show={shouldShow}>
        Stake with{' '}
        {apr && (
          <Loader isLoading={isLoading}>
            <FormatPercent decimals="percent" value={apr} /> APR
          </Loader>
        )}{' '}
        <Body as="span" color="tertiary">
          daily rewards, stay liquid
        </Body>
      </UnconnectedText>
    </BorderedCard>
  );
};

const ConnectedPosition = () => {
  // 'eth' sort gates on the wstETH rate whenever wstETH is held,
  // so the total never shows without its wstETH part
  const { data: position, isLoading: isPositionLoading } =
    useCrossStakingChainPosition({ sort: 'usd' });
  const { data: aprData, isLoading: isAprLoading } = useLidoApr();

  const shouldShow = useDelayedShow([isPositionLoading, isAprLoading]);

  return (
    <BorderedCard>
      <PositionGrid $show={shouldShow}>
        <PositionTitle>Staked position</PositionTitle>
        <PositionAmount>
          <Loader isLoading={isPositionLoading}>
            {' '}
            <FormatToken amount={position?.totalEthValue} symbol="ETH" />
          </Loader>
        </PositionAmount>
        <PositionAPR>
          {aprData?.data?.smaApr && (
            <FormatPercent decimals="percent" value={aprData.data.smaApr} />
          )}{' '}
          APR
        </PositionAPR>
      </PositionGrid>
      {/*
        TODO: withdrawal part of ui    

       */}
    </BorderedCard>
  );
};

export const Position = () => {
  const { isWalletConnected } = useDappStatus();

  if (!isWalletConnected) {
    return <UnconnectedPosition />;
  }

  return <ConnectedPosition />;
};
