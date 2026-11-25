import type { FC } from 'react';
import styled from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

import { useWinterTheme } from './winter-theme-context';

// matches the theme toggler next to it
const ControlButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: var(--lido-color-foreground);
  color: var(--lido-color-text);

  &:focus-visible {
    outline: 3px solid var(--lido-color-primary);
    outline-offset: 2px;
  }

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

const Slash: FC = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 44 44"
    aria-hidden="true"
    style={{ position: 'absolute', inset: 0 }}
  >
    <path
      d="M12 32 L32 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const WinterHeaderControls: FC = () => {
  const { enabled, snow, lights, toggleSnow, toggleLights } = useWinterTheme();
  if (!enabled) return null;

  return (
    <>
      <ControlButton
        type="button"
        aria-label="Snowfall"
        aria-pressed={snow}
        title={snow ? 'Snowfall: on' : 'Snowfall: off'}
        onClick={toggleSnow}
        data-testid="winterSnowToggle"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.6l3 2 3-2M9 20.4l3-2 3 2M3.6 10.4l2.6-1.7-.1-3.3M17.9 18.6l-.1-3.3 2.6-1.7M3.6 13.6l2.6 1.7-.1 3.3M17.9 5.4l-.1 3.3 2.6 1.7" />
        </svg>
        {!snow && <Slash />}
      </ControlButton>
      <ControlButton
        type="button"
        aria-label="Garland lights"
        aria-pressed={lights}
        title={lights ? 'Lights: on' : 'Lights: off'}
        onClick={toggleLights}
        data-testid="winterLightsToggle"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
        </svg>
        {!lights && <Slash />}
      </ControlButton>
    </>
  );
};
