import { FC } from 'react';

import {
  OptionStyled,
  OptionTitleStyled,
  OptionInfoStyled,
  OptionDescRangeStyled,
  OptionDescStyled,
  OptionAmountStyled,
  LidoIcon,
  OneinchIcon,
  PrimaryLableStyled,
} from './styles';

const Icons = {
  lido: <LidoIcon />,
  oneinch: <OneinchIcon />,
};

export type OptionProps = {
  title: string;
  timeRange: string;
  type: keyof typeof Icons;
  selected?: boolean;
  onClick: (type: keyof typeof Icons) => void;
  primary?: boolean;
};

export const Option: FC<OptionProps> = (props) => {
  const { children, title, timeRange, type, selected, onClick, primary } =
    props;

  const onOptionClick = () => {
    onClick?.(type);
  };

  return (
    <OptionStyled $selected={selected} onClick={onOptionClick}>
      {primary && <PrimaryLableStyled>Primary</PrimaryLableStyled>}
      {Icons[type]}
      <OptionInfoStyled>
        <OptionTitleStyled>{title}</OptionTitleStyled>
        <OptionDescStyled>
          Waiting time:{' '}
          <OptionDescRangeStyled>{timeRange}</OptionDescRangeStyled>
        </OptionDescStyled>
      </OptionInfoStyled>
      <OptionAmountStyled>{children}</OptionAmountStyled>
    </OptionStyled>
  );
};
