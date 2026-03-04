import { StrategyIcon } from './stratagy-icon';

import { StrategyItemStyled } from './styles';

export type StrategyItemProps = {
  protocol: string;
  badge: string;
  name: string;
};

export const StrategyItem = (props: StrategyItemProps) => {
  const { protocol, badge, name } = props;

  return (
    <StrategyItemStyled>
      <StrategyIcon mainIcon={protocol} badge={badge} />
      <span>{name}</span>
    </StrategyItemStyled>
  );
};
