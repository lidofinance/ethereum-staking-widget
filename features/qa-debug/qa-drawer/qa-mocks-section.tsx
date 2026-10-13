import { FC, useState } from 'react';
import { parseEther } from 'viem';
import { Accordion, Input, Option, Select } from '@lidofinance/lido-ui';

import { QA_MOCK_GROUPS, type QaMockDescriptor } from 'consts/qa-keys';

import {
  SectionStack,
  GroupTitle,
  MockRow,
  MockLabel,
  MockHint,
  ValidationStatus,
} from './styles';

const UNSET = '';

const readMock = (key: string): string => localStorage.getItem(key) ?? UNSET;

const writeMock = (key: string, value: string): void => {
  if (value === UNSET) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
};

// A persisted garbage value would throw inside consumers on next render
// (overrideWithQAMockEther/BigInt invariant) and error-boundary the whole
// app with the drawer unreachable — so invalid input is never written.
const getValueError = (
  mock: QaMockDescriptor,
  value: string,
): string | null => {
  if (value === UNSET) return null;
  switch (mock.type) {
    case 'ether':
      try {
        parseEther(value);
        return null;
      } catch {
        return 'Invalid ETH amount — not saved';
      }
    case 'bigint':
      try {
        BigInt(value);
        return null;
      } catch {
        return 'Invalid wei value (integer expected) — not saved';
      }
    case 'number':
      return isNaN(Number(value)) ? 'Invalid number — not saved' : null;
    case 'json':
      try {
        JSON.parse(value);
        return null;
      } catch {
        return 'Invalid JSON — not saved';
      }
    default:
      return null;
  }
};

const MockControl: FC<{ mock: QaMockDescriptor }> = ({ mock }) => {
  const [value, setValue] = useState(() => readMock(mock.key));
  const [error, setError] = useState<string | null>(null);

  const update = (next: string) => {
    setValue(next);
    const valueError = getValueError(mock, next);
    setError(valueError);
    if (valueError) localStorage.removeItem(mock.key);
    else writeMock(mock.key, next);
  };

  const control =
    mock.type === 'boolean' || mock.type === 'enum' ? (
      <Select
        fullwidth
        arrow="small"
        variant="small"
        value={value}
        onChange={(next) => update(String(next))}
      >
        <Option value={UNSET}>(not set)</Option>
        {(mock.type === 'boolean' ? ['true', 'false'] : mock.options).map(
          (option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ),
        )}
      </Select>
    ) : (
      <Input
        fullwidth
        variant="small"
        value={value}
        placeholder="(not set)"
        onChange={(event) => update(event.currentTarget.value)}
      />
    );

  return (
    <MockRow>
      <MockLabel>{mock.label}</MockLabel>
      {control}
      {error && <ValidationStatus $isError>{error}</ValidationStatus>}
      {mock.description && <MockHint>{mock.description}</MockHint>}
    </MockRow>
  );
};

export const QaMocksSection: FC = () => (
  <Accordion summary="QA mocks (reload to apply)" defaultExpanded>
    <SectionStack>
      {QA_MOCK_GROUPS.map((group) => (
        <SectionStack key={group.title}>
          <GroupTitle>{group.title}</GroupTitle>
          {group.mocks.map((mock) => (
            <MockControl key={mock.key} mock={mock} />
          ))}
        </SectionStack>
      ))}
    </SectionStack>
  </Accordion>
);
