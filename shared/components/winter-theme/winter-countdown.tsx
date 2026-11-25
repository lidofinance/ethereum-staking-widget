import { useEffect, useState, type FC } from 'react';
import styled from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

import { getCountdownState, type CountdownState } from './countdown';
import { useWinterTheme } from './winter-theme-context';

const Row = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 14px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: 0;
  }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  background: var(--lido-color-foreground);
  color: var(--lido-color-text);
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 14px var(--winter-chip-shadow);
`;

const Digits = styled.span`
  font-variant-numeric: tabular-nums;
`;

export const WinterCountdown: FC = () => {
  const { enabled } = useWinterTheme();
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => setState(getCountdownState(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  if (!enabled || !state) return null;

  return (
    <Row data-winter="countdown">
      <Chip role="timer" aria-live="off">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{ stroke: 'var(--lido-color-primary)' }}
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
        </svg>
        {state.kind === 'countdown' ? (
          <span>
            New Year in <Digits>{state.label}</Digits>
          </span>
        ) : (
          <span>{state.label}</span>
        )}
      </Chip>
    </Row>
  );
};
