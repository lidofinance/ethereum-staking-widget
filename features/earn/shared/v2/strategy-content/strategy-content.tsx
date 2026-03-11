import { StrategyItem, StrategyItemProps } from './strategy-item';
import { StrategyContentStyled } from './styles';

type StrategyContentProps = {
  allocations: StrategyItemProps[];
};

// TODO: replace with dynamic content from API
export const StrategyContent = (props: StrategyContentProps) => {
  const { allocations } = props;

  return (
    <StrategyContentStyled>
      {allocations.map((allocation) => (
        <StrategyItem key={allocation.name} {...allocation} />
      ))}
    </StrategyContentStyled>
  );
};
