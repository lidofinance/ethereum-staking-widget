import { Body } from '@lidofinance/lido-app-ui';
import { useCrossStakingChainPosition, useDappStatus } from 'modules/web3';
import { FormatPercent, FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';

import { useDelayedShow } from '../../utils';
import {
  BorderedCard,
  PositionGrid,
  PositionTitle,
  PositionAPR,
  PositionAmount,
  UnconnectedText,
} from './styles';

type UnconnectedPositionProps = { isWalletResolving: boolean };

const UnconnectedPosition = ({
  isWalletResolving,
}: UnconnectedPositionProps) => {
  const { data, isLoading } = useLidoApr();
  // resolving is a gate, not a loading flag: the 300ms timeout must not
  // flash "stake with" while the boot auto-connect may still land
  const shouldShow = useDelayedShow([isLoading]) && !isWalletResolving;

  const apr = data?.data?.smaApr;

  return (
    <BorderedCard>
      <UnconnectedText $show={shouldShow}>
        Stake with{' '}
        {apr && (
          <>
            <FormatPercent decimals="percent" value={apr} /> APR
          </>
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
    useCrossStakingChainPosition({ sort: 'eth' });
  const { data: aprData, isLoading: isAprLoading } = useLidoApr();

  const shouldShow = useDelayedShow([isPositionLoading, isAprLoading]);

  return (
    <BorderedCard>
      <PositionGrid $show={shouldShow}>
        <PositionTitle>Staked position</PositionTitle>
        <PositionAmount>
          <FormatToken amount={position?.totalEthValue} symbol="ETH" />
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
  const { isWalletConnected, isWalletResolving } = useDappStatus();

  if (!isWalletConnected) {
    return <UnconnectedPosition isWalletResolving={isWalletResolving} />;
  }

  return <ConnectedPosition />;
};
