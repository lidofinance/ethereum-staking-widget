import { FC, ReactNode } from 'react';

import {
  Block,
  Title,
  Value,
  ValueGreen,
  UnderValue,
  InlineLoader,
} from './styles';

type ItemProps = {
  dataTestId: string;
  title: ReactNode | ReactNode[];

  value: ReactNode | ReactNode[];
  valueDataTestId: string;
  valueGreenText?: boolean | undefined;

  underValue?: ReactNode | ReactNode[] | undefined;
  underValueDataTestId?: string | undefined;

  loading: boolean;
};

export const Item: FC<ItemProps> = (props) => {
  const {
    dataTestId,
    title,
    value,
    valueDataTestId,
    valueGreenText,
    underValue,
    underValueDataTestId,
    loading,
  } = props;

  const _Value = valueGreenText ? ValueGreen : Value;

  return (
    <Block data-testid={dataTestId}>
      <Title>{title}</Title>
      <_Value data-testid={valueDataTestId}>
        {!loading ? value : <InlineLoader />}
      </_Value>
      <UnderValue data-testid={underValueDataTestId}>
        {!loading ? underValue : <InlineLoader />}
      </UnderValue>
    </Block>
  );
};
