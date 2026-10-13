import { FC, useState, useSyncExternalStore } from 'react';
import { Accordion, Button, Checkbox } from '@lidofinance/lido-ui';

import { QA_KEYS } from 'consts/qa-keys';

import {
  clearMatomoEventLog,
  getMatomoEventLog,
  getMatomoEventLogServerSnapshot,
  subscribeToMatomoEventLog,
} from '../matomo-log';

import {
  SectionStack,
  SnapshotActions,
  MockHint,
  LogList,
  LogEntry,
  LogTime,
  LogEventName,
} from './styles';

const formatTime = (time: number): string => {
  const date = new Date(time);
  return `${date.toTimeString().slice(0, 8)}.${String(
    date.getMilliseconds(),
  ).padStart(3, '0')}`;
};

// Applied live — trackMatomoEvent reads the flag on every call, no reload.
const LoggingToggle: FC = () => {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(QA_KEYS.matomoLogging) === 'true',
  );

  const toggle = (next: boolean) => {
    setEnabled(next);
    if (next) localStorage.setItem(QA_KEYS.matomoLogging, 'true');
    else localStorage.removeItem(QA_KEYS.matomoLogging);
  };

  return (
    <Checkbox
      label="Log Matomo events (console + list below)"
      checked={enabled}
      onChange={(event) => toggle(event.currentTarget.checked)}
    />
  );
};

export const MatomoLogSection: FC = () => {
  const entries = useSyncExternalStore(
    subscribeToMatomoEventLog,
    getMatomoEventLog,
    getMatomoEventLogServerSnapshot,
  );

  return (
    <Accordion summary={`Matomo event log (${entries.length})`}>
      <SectionStack>
        <LoggingToggle />
        <MockHint>
          Events sent via trackMatomoEvent while logging is on, newest first.
          The last 200 are kept.
        </MockHint>
        <SnapshotActions>
          <Button
            size="xs"
            variant="outlined"
            onClick={clearMatomoEventLog}
            disabled={entries.length === 0}
          >
            Clear log
          </Button>
        </SnapshotActions>
        {entries.length > 0 && (
          <LogList data-testid="matomo-event-log">
            {entries.map(({ id, time, label, event }) => (
              <LogEntry key={id}>
                <LogTime>{formatTime(time)}</LogTime>
                <LogEventName>{label}</LogEventName>
                {` — ${event.join(' · ')}`}
              </LogEntry>
            ))}
          </LogList>
        )}
      </SectionStack>
    </Accordion>
  );
};
