import { type Address } from 'viem';

import { FormatPrice, FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';

import { VaultTip } from '../vault-tip';
import { InlineLoader } from '../inline-loader';

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
            <FormatToken
              symbol={position.symbol}
              amount={position.balance}
              trimEllipsis
              fallback="-"
            />{' '}
            <TokenToWallet address={position.token} />
          </PositionBalance>
        </InlineLoader>
      </PositionBalance>
      {!position.isLoading && position.usdAmount != null && (
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
          My position <VaultTip placement="topLeft">{positionTip}</VaultTip>
        </PositionEntryTitle>
        <PositionBody position={position} />
      </PositionEntry>
      {rewards && (
        <PositionEntry>
          <PositionEntryTitle>
            Rewards <VaultTip placement="topLeft">{rewardsTip}</VaultTip>
          </PositionEntryTitle>
          {rewards.map((reward) => (
            <PositionBody position={reward} key={reward.symbol} />
          ))}
        </PositionEntry>
      )}
      {points && (
        <PositionEntry>
          <PositionEntryTitle>
            Points <VaultTip placement="topLeft">{pointsTip}</VaultTip>
          </PositionEntryTitle>
          {points.map((point) => (
            <PositionBody compact position={point} key={point.symbol} />
          ))}
        </PositionEntry>
      )}
    </PositionContainer>
  );
};
