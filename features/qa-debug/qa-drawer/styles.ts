import styled from 'styled-components';

export const CodeBlock = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--lido-color-background);
  font-size: 11px;
  line-height: 1.45;
  overflow: auto;
  max-height: 320px;
`;

export const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const GroupTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--lido-color-textSecondary);

  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const MockRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MockLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 16px;
  color: var(--lido-color-textSecondary);
`;

export const MockHint = styled.div`
  font-size: 11px;
  line-height: 16px;
  color: var(--lido-color-textSecondary);
`;

export const SnapshotActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 8px;
  background: var(--lido-color-background);
  font-family: monospace;
  font-size: 11px;
  line-height: 1.45;
  overflow: auto;
  max-height: 320px;
`;

export const LogEntry = styled.div`
  word-break: break-word;
`;

export const LogTime = styled.span`
  color: var(--lido-color-textSecondary);
  margin-right: 6px;
`;

export const LogEventName = styled.span`
  font-weight: 700;
`;

export const JsonTextarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 220px;
  padding: 12px;
  border: 1px solid var(--lido-color-border);
  border-radius: 8px;
  background: var(--lido-color-background);
  color: var(--lido-color-text);
  font-family: monospace;
  font-size: 11px;
  line-height: 1.45;
  resize: vertical;
`;

export const ValidationStatus = styled.div<{ $isError?: boolean }>`
  font-size: 11px;
  line-height: 16px;
  white-space: pre-wrap;
  color: ${({ $isError }) =>
    $isError ? 'var(--lido-color-error)' : 'var(--lido-color-success)'};
`;
