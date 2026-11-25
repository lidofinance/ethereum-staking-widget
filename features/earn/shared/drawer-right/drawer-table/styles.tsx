import styled from 'styled-components';
import { Tag } from '@lidofinance/lido-app-ui';

// the app-ui palette has no such colour
const HIGHLIGHT_BORDER = '1px solid #c9acff';
const LABEL_COLUMN_WIDTH = 100;

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const TableTitle = styled.p`
  margin: 0;
  font-size: var(--lido-app-ui-font-size-body);
  font-weight: var(--lido-app-ui-font-weight-bold);
  line-height: var(--lido-app-ui-line-height-label);
  color: var(--lido-app-ui-color-text-default);
`;

export const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: var(--lido-app-ui-color-text-default);

  col:first-child {
    width: ${LABEL_COLUMN_WIDTH}px;
  }

  th,
  td {
    padding: var(--lido-app-ui-space-12);
    font-size: var(--lido-app-ui-font-size-tooltip);
    font-weight: var(--lido-app-ui-font-weight-regular);
    line-height: var(--lido-app-ui-line-height-description);
    letter-spacing: var(--lido-app-ui-letter-spacing-tooltip);
    text-align: left;
    vertical-align: top;
    overflow-wrap: break-word;
  }

  th {
    vertical-align: bottom;
  }

  // the label column has no left padding
  th:first-child,
  td:first-child {
    padding-left: 0;
    font-weight: var(--lido-app-ui-font-weight-semibold);
  }

  tbody td {
    border-bottom: 1px solid var(--lido-app-ui-color-border-default);
  }

  tbody tr:first-child td {
    border-top: 1px solid var(--lido-app-ui-color-border-default);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  // the "after upgrade" column gets a rounded lilac frame
  th:last-child,
  td:last-child {
    border-right: ${HIGHLIGHT_BORDER};
    border-left: ${HIGHLIGHT_BORDER};
  }

  th:last-child {
    border-top: ${HIGHLIGHT_BORDER};
    border-radius: var(--lido-app-ui-border-radius-lg)
      var(--lido-app-ui-border-radius-lg) 0 0;
  }

  tbody td:last-child {
    border-top-color: #c9acff;
    border-bottom: ${HIGHLIGHT_BORDER};
  }

  tbody tr:last-child td:last-child {
    border-bottom: ${HIGHLIGHT_BORDER};
    border-radius: 0 0 var(--lido-app-ui-border-radius-lg)
      var(--lido-app-ui-border-radius-lg);
  }
`;

export const HeaderCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--lido-app-ui-space-8);
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
  font-size: var(--lido-app-ui-font-size-body);
  font-weight: var(--lido-app-ui-font-weight-semibold);
  line-height: var(--lido-app-ui-line-height-body);
  letter-spacing: var(--lido-app-ui-letter-spacing-body);
  white-space: nowrap;

  & > svg {
    flex-shrink: 0;
  }
`;

export const AfterUpgradeTag = styled(Tag)`
  --lido-app-ui-tag-background: linear-gradient(
    81.56deg,
    rgba(106, 154, 255, 0.5) 2.29%,
    rgba(201, 172, 255, 0.5) 40.94%,
    rgba(255, 206, 190, 0.5) 105%
  );
  --lido-app-ui-tag-color: var(--lido-app-ui-color-text-default);
`;
