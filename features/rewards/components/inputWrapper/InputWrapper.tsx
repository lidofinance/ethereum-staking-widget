import { FC, PropsWithChildren } from 'react';
import { BlockProps } from '@lidofinance/lido-ui';

import { InputWrapperStyle } from './InputWrapperStyles';

export const InputWrapper: FC<PropsWithChildren<BlockProps>> = ({
  children,
  ...rest
}) => {
  return <InputWrapperStyle {...rest}>{children}</InputWrapperStyle>;
};
