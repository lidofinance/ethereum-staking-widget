import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { HOME_PATH } from 'consts/urls';
import { devicesHeaderMedia } from 'styles/global';

import { getCountdownState, type CountdownState } from './countdown';
import { useWinterTheme } from './winter-theme-context';

const CHIP_HEIGHT = 32;

// The row is reserved from the server-known flag, the chip fills it after
// mount, so the title below never jumps
const Row = styled.div`
  display: flex;
  justify-content: center;
  height: ${CHIP_HEIGHT}px;
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
  height: ${CHIP_HEIGHT}px;
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

// Stake page only
export const WinterCountdown: FC = () => {
  const { requested, enabled } = useWinterTheme();
  const { pathname } = useRouter();
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => setState(getCountdownState(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  if (!requested || pathname !== HOME_PATH) return null;

  return (
    <Row data-winter="countdown">
      {enabled && state && (
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
      )}
    </Row>
  );
};
