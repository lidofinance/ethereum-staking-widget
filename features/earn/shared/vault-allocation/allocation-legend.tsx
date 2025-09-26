import { LineData } from '@lidofinance/lido-ui';

import {
  AllocationLegendContainer,
  AllocationLegendCircle,
  AllocationLegendItem,
} from './styles';

type AllocationLegendProps = {
  data: (LineData & { allocation: number })[];
};

export const AllocationLegend = ({ data }: AllocationLegendProps) => {
  return (
    <AllocationLegendContainer>
      {data.map((item) => (
        <AllocationLegendItem key={item.color}>
          <AllocationLegendCircle style={{ backgroundColor: item.color }} />
          <div>
            {item.threshold.label} {item.allocation}%
          </div>
        </AllocationLegendItem>
      ))}
    </AllocationLegendContainer>
  );
};
