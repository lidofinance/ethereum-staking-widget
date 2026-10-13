import { FC } from 'react';
import { Accordion, Button, ToastSuccess } from '@lidofinance/lido-ui';

import { config, useConfig } from 'config';

import { CodeBlock, SectionStack, SnapshotActions } from './styles';

const stringify = (value: unknown): string =>
  JSON.stringify(
    value,
    (_, v: unknown) => (typeof v === 'bigint' ? v.toString() : v),
    2,
  );

const CopyButton: FC<{ getText: () => string }> = ({ getText }) => (
  <Button
    size="xs"
    variant="outlined"
    onClick={() => {
      void navigator.clipboard.writeText(getText());
      ToastSuccess('Copied to clipboard');
    }}
  >
    Copy JSON
  </Button>
);

export const ConfigSnapshot: FC = () => {
  const { externalConfig } = useConfig();
  // fetchMeta is a react-query result — not serializable, not config
  const { fetchMeta: _fetchMeta, ...manifest } = externalConfig;

  const snapshots: [string, unknown][] = [
    ['config', config],
    ['window.__env__', window.__env__],
    ['external config (manifest)', manifest],
  ];

  return (
    <Accordion summary="Config snapshot (read-only)">
      <SectionStack>
        {snapshots.map(([title, value]) => (
          <SectionStack key={title}>
            <SnapshotActions>
              <span>{title}</span>
              <CopyButton getText={() => stringify(value)} />
            </SnapshotActions>
            <CodeBlock>{stringify(value)}</CodeBlock>
          </SectionStack>
        ))}
      </SectionStack>
    </Accordion>
  );
};
