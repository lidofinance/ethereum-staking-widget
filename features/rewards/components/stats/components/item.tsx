import { FC, ReactNode } from 'react';

import { Block, Title, Value, UnderValue, InlineLoader } from './styles';

type ItemProps = {
  dataTestId: string;
  title: ReactNode | ReactNode[];

  value: ReactNode | ReactNode[];
  valueDataTestId: string;

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
    underValue,
    underValueDataTestId,
    loading,
  } = props;

  return (
    <Block data-testid={dataTestId}>
      <Title>{title}</Title>
      <Value data-testid={valueDataTestId}>
        {!loading ? value : <InlineLoader />}
      </Value>
      <UnderValue data-testid={underValueDataTestId}>
        {!loading ? underValue : <InlineLoader />}
      </UnderValue>
    </Block>
  );
};
