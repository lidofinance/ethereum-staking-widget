import { FC } from 'react';
import { InlineLoader } from '@lidofinance/lido-ui';

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
  OptionDescRangeLoaderWraper,
} from './styles';

const Icons = {
  lido: <LidoIcon />,
  oneinch: <OneinchIcon />,
};

export type OptionProps = {
  title: string;
  timeRange: string;
  isTimeRangeLoading?: boolean;
  type: keyof typeof Icons;
  selected?: boolean;
  onClick: (type: keyof typeof Icons) => void;
  primary?: boolean;
};

export const Option: FC<OptionProps> = (props) => {
  const {
    children,
    title,
    timeRange,
    type,
    selected,
    onClick,
    primary,
    isTimeRangeLoading,
  } = props;

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
          {isTimeRangeLoading ? (
            <OptionDescRangeLoaderWraper>
              <InlineLoader />
            </OptionDescRangeLoaderWraper>
          ) : (
            <OptionDescRangeStyled>{timeRange}</OptionDescRangeStyled>
          )}
        </OptionDescStyled>
      </OptionInfoStyled>
      <OptionAmountStyled>{children}</OptionAmountStyled>
    </OptionStyled>
  );
};
