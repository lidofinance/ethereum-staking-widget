import { type Address } from 'viem';
import { InlineLoader, Tooltip, Question } from '@lidofinance/lido-ui';

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

type TokenBalance = {
  token?: Address;
  symbol: string;
  balance?: bigint;
  icon?: React.ReactNode;
  usdAmount?: number;
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

const PositionBody = ({ position }: { position: TokenBalance }) => {
  return (
    <PositionEntryBody>
      <PositionIcon>{position.icon}</PositionIcon>
      {position.isLoading ? (
        // singular loader for shares/usd
        <PositionBalance>
          <InlineLoader />
        </PositionBalance>
      ) : (
        <>
          <PositionBalance>
            <FormatToken symbol={position.symbol} amount={position.balance} />
          </PositionBalance>
          {position.usdAmount !== undefined && (
            <PositionSubBalance>
              <FormatPrice amount={position.usdAmount} />
            </PositionSubBalance>
          )}
        </>
      )}

      <PositionSubBalance>
        {position.isLoading ? (
          <InlineLoader />
        ) : (
          <FormatPrice amount={position.usdAmount} />
        )}
      </PositionSubBalance>
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
            My rewards{' '}
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
            My Points{' '}
            {pointsTip && (
              <Tooltip placement="top" title={pointsTip}>
                <Question />
              </Tooltip>
            )}
          </PositionEntryTitle>
          {points.map((point) => (
            <PositionBody position={point} key={point.symbol} />
          ))}
        </PositionEntry>
      )}
    </PositionContainer>
  );
};
