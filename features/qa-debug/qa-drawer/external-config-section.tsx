import { FC, useState } from 'react';
import { Accordion, Button, Checkbox } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import { ManifestEntrySchema } from 'config/external-config';
import { QA_KEYS } from 'consts/qa-keys';

import {
  SectionStack,
  MockHint,
  JsonTextarea,
  ValidationStatus,
  SnapshotActions,
} from './styles';

type ValidationResult = { message: string; isError: boolean } | null;

const validateEntry = (raw: string): ValidationResult => {
  if (!raw.trim()) return { message: 'Empty mock', isError: true };
  try {
    const parsed = ManifestEntrySchema.safeParse(JSON.parse(raw));
    return parsed.success
      ? { message: 'Valid manifest entry', isError: false }
      : { message: parsed.error.message, isError: true };
  } catch (err) {
    return { message: `Invalid JSON: ${String(err)}`, isError: true };
  }
};

export const ExternalConfigSection: FC = () => {
  const { externalConfig } = useConfig();
  const fetchedEntry = externalConfig.fetchMeta.data;

  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem(QA_KEYS.externalConfigMockEnabled) === 'true',
  );
  const [text, setText] = useState(
    () => localStorage.getItem(QA_KEYS.externalConfigMock) ?? '',
  );
  const [validation, setValidation] = useState<ValidationResult>(null);

  const toggle = (next: boolean) => {
    setIsEnabled(next);
    if (next) localStorage.setItem(QA_KEYS.externalConfigMockEnabled, 'true');
    else localStorage.removeItem(QA_KEYS.externalConfigMockEnabled);
  };

  const update = (next: string) => {
    setText(next);
    setValidation(null);
    if (next.trim()) localStorage.setItem(QA_KEYS.externalConfigMock, next);
    else localStorage.removeItem(QA_KEYS.externalConfigMock);
  };

  return (
    <Accordion
      summary={`External config mock${isEnabled && text.trim() ? ' — ACTIVE' : ''}`}
    >
      <SectionStack>
        <Checkbox
          label="Use mocked manifest entry"
          checked={isEnabled}
          onChange={(event) => toggle(event.currentTarget.checked)}
        />
        <MockHint>
          Replaces the fetched manifest entry for the current chain after
          reload. Invalid JSON or schema falls back to the real config (warning
          in the console). Runtime overrides and consumer-side clamps still
          apply on top.
        </MockHint>
        <JsonTextarea
          value={text}
          placeholder='{"leastSafeVersion": "...", "config": {...}}'
          spellCheck={false}
          onChange={(event) => update(event.currentTarget.value)}
        />
        <SnapshotActions>
          <Button
            size="xs"
            variant="outlined"
            disabled={!fetchedEntry}
            onClick={() => update(JSON.stringify(fetchedEntry, null, 2))}
          >
            Load current
          </Button>
          <Button
            size="xs"
            variant="outlined"
            onClick={() => setValidation(validateEntry(text))}
          >
            Validate
          </Button>
        </SnapshotActions>
        {validation && (
          <ValidationStatus $isError={validation.isError}>
            {validation.message}
          </ValidationStatus>
        )}
      </SectionStack>
    </Accordion>
  );
};
