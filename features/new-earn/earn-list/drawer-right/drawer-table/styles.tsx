import styled from 'styled-components';

export const TableHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 700;
  line-height: 24px;
`;

export const Table = styled.table`
  margin-top: 12px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 12px 20px;
    border-spacing: 20px;
    font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
    font-weight: 400;
    line-height: 24px;
    vertical-align: top;
  }

  td:first-child {
    text-wrap: nowrap;
  }

  tr {
    td {
      border-bottom: 1px solid #000a3d1f;
    }
  }

  tr:first-child {
    td {
      border-top: 1px solid #000a3d1f;
    }
  }

  tr:last-child {
    td {
      border-bottom: none;
    }
  }
`;

export const Tbody = styled.tbody`
  & > tr:last-child > td:last-child {
    border-bottom: 1px solid #c9acff;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }
`;

export const HeaderTr = styled.tr`
  th {
    font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
    font-weight: 700;
    line-height: 28px;
    vertical-align: bottom;
  }
  & > th:last-child {
    border-left: 1px solid #c9acff;
    border-right: 1px solid #c9acff;
    border-top: 1px solid #c9acff;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }
`;

export const Tr = styled.tr`
  & > td:first-child {
    font-weight: 700;
  }
  & > td:last-child {
    border-left: 1px solid #c9acff;
    border-right: 1px solid #c9acff;
  }
`;

export const Td = styled.td`
  padding: 12px 20px;
`;

export const HeaderWithIcon = styled.div`
  display: flex;
  align-items: center;
`;
