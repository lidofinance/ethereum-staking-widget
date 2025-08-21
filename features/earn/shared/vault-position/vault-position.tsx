import { type Address } from 'viem';
import { Tooltip, Question } from '@lidofinance/lido-ui';

import { FormatPrice, FormatToken } from 'shared/formatters';
import {
  PositionBalance,
  PositionContainer,
  PositionEntry,
  PositionEntryBody,
  PositionEntryTitle,
  PositionIcon,
  PositionSubBalance,
  PositionDecorator,
} from './styles';
import { InlineLoader } from '../inline-loader';
import { TokenToWallet } from 'shared/components';

type TokenBalance = {
  token?: Address;
  symbol: string;
  balance?: bigint;
  decimals?: number;
  icon?: React.ReactNode;
  usdAmount?: number | null;
  isLoading?: boolean;
  rightDecorator?: React.ReactNode;
};

export type VaultPositionProps = {
  position: TokenBalance;
  positionTip?: React.ReactNode;
  rewards?: TokenBalance[];
  rewardsTip?: React.ReactNode;
  points?: TokenBalance[];
  pointsTip?: React.ReactNode;
};

type PositionBodyProps = {
  position: TokenBalance;
  compact?: boolean;
};

const PositionBody = ({ position, compact }: PositionBodyProps) => {
  return (
    <PositionEntryBody compact={compact}>
      <PositionIcon>{position.icon}</PositionIcon>

      <PositionBalance>
        <InlineLoader width={78} isLoading={position.isLoading}>
          <PositionBalance>
            <FormatToken symbol={position.symbol} amount={position.balance} />{' '}
            <TokenToWallet address={position.token} />
          </PositionBalance>
        </InlineLoader>
      </PositionBalance>
      {!position.isLoading && position.usdAmount !== null && (
        <PositionSubBalance>
          <FormatPrice amount={position.usdAmount} />
        </PositionSubBalance>
      )}
      {position.rightDecorator && (
        <PositionDecorator>{position.rightDecorator}</PositionDecorator>
      )}
    </PositionEntryBody>
  );
};

export const VaultPosition = ({
  position,
  positionTip,
  rewards,
  rewardsTip,
  points,
  pointsTip,
}: VaultPositionProps) => {
  return (
    <PositionContainer>
      <PositionEntry>
        <PositionEntryTitle>
          My position{' '}
          {positionTip && (
            <Tooltip placement="top" title={positionTip}>
              <Question />
            </Tooltip>
          )}
        </PositionEntryTitle>
        <PositionBody position={position} />
      </PositionEntry>
      {rewards && (
        <PositionEntry>
          <PositionEntryTitle>
            Rewards{' '}
            {rewardsTip && (
              <Tooltip placement="top" title={rewardsTip}>
                <Question />
              </Tooltip>
            )}
          </PositionEntryTitle>
          {rewards.map((reward) => (
            <PositionBody position={reward} key={reward.symbol} />
          ))}
        </PositionEntry>
      )}
      {points && (
        <PositionEntry>
          <PositionEntryTitle>
            Points{' '}
            {pointsTip && (
              <Tooltip placement="top" title={pointsTip}>
                <Question />
              </Tooltip>
            )}
          </PositionEntryTitle>
          {points.map((point) => (
            <PositionBody compact position={point} key={point.symbol} />
          ))}
        </PositionEntry>
      )}
    </PositionContainer>
  );
};
