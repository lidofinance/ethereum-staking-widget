import { LIMIT_LEVEL } from 'types';
import { LimitReachedIcon, LimitSafeIcon, LimitWarnIcon } from './icons';
import { TooltipHoverable } from 'shared/components';
import {
  Bars,
  EmptyBar,
  GreenBar,
  GreenSpan,
  IconWrapper,
  LevelContainer,
  LevelText,
  RedBar,
  RedSpan,
  YellowBar,
  YellowSpan,
} from './styles';
import { LimitComponent } from './types';

const LevelSafe = () => (
  <LevelContainer>
    <LevelText>
      <span>Staking limit level:</span>
      <GreenSpan>Safe to stake</GreenSpan>
    </LevelText>
    <Bars>
      <GreenBar />
      <EmptyBar />
      <EmptyBar />
    </Bars>
  </LevelContainer>
);

const LevelWarn = () => (
  <LevelContainer>
    <LevelText>
      <span>Staking limit level:</span>
      <YellowSpan>Almost reached</YellowSpan>
    </LevelText>
    <Bars>
      <YellowBar />
      <YellowBar />
      <EmptyBar />
    </Bars>
  </LevelContainer>
);

const LevelReached = () => (
  <LevelContainer>
    <LevelText>
      <span>Staking limit level:</span>
      <RedSpan>Reached</RedSpan>
    </LevelText>
    <Bars>
      <RedBar />
      <RedBar />
      <RedBar />
    </Bars>
  </LevelContainer>
);

const Level: LimitComponent = ({ limitLevel }) => {
  switch (limitLevel) {
    case LIMIT_LEVEL.WARN:
      return <LevelWarn />;
    case LIMIT_LEVEL.REACHED:
      return <LevelReached />;
    default:
      return <LevelSafe />;
  }
};

const LimitIcon: LimitComponent = ({ limitLevel }) => {
  switch (limitLevel) {
    case LIMIT_LEVEL.WARN:
      return <LimitWarnIcon />;
    case LIMIT_LEVEL.REACHED:
      return <LimitReachedIcon />;
    default:
      return <LimitSafeIcon />;
  }
};

export const LimitHelp: LimitComponent = ({ limitLevel }) => {
  return (
    <TooltipHoverable
      title={
        <div>
          <p>
            Represents how much ether you can stake at this moment. You cannot
            stake over the global staking limit. The global limit goes down with
            each deposit but it&apos;s passively restored on each block.{' '}
            <a
              href="https://docs.lido.fi/guides/steth-integration-guide#staking-rate-limits"
              target="_blank"
              rel="noreferrer"
            >
              More info
            </a>
          </p>
          <Level limitLevel={limitLevel} />
        </div>
      }
    >
      <IconWrapper>
        <LimitIcon limitLevel={limitLevel} />
      </IconWrapper>
    </TooltipHoverable>
  );
};
