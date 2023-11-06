import { FC, memo, PropsWithChildren, ReactNode } from 'react';
import { DataTableRow } from '@lidofinance/lido-ui';
import { DATA_UNAVAILABLE } from 'config';

type LidoStatsItemProps = {
  show: boolean;
  loading: boolean;
  dataTestId: string;
  title: ReactNode;
  highlight?: boolean | undefined;
};

export const LidoStatsItem: FC<PropsWithChildren<LidoStatsItemProps>> = memo(
  (props) => {
    const { show, loading, dataTestId, title, children, highlight } = props;

    if (!show) {
      return null;
    }

    return (
      <DataTableRow
        title={title}
        loading={loading}
        data-testid={dataTestId}
        highlight={highlight}
      >
        {children || DATA_UNAVAILABLE}
      </DataTableRow>
    );
  },
);
