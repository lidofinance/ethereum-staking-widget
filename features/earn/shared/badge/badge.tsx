import { ShieldCheckIcon } from 'assets/earn';

import { BadgeStyled, TooltipStyled } from './styles';

type BadgeProps = {
  text: string;
  tooltipText?: React.ReactNode;
};

export const Badge = ({ text, tooltipText }: BadgeProps) => {
  return (
    <TooltipStyled title={tooltipText} placement="bottom">
      <BadgeStyled>
        <ShieldCheckIcon />
        {text}
      </BadgeStyled>
    </TooltipStyled>
  );
};
