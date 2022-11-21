import { FC } from 'react';
import { BlockProps } from '@lidofinance/lido-ui';

import { InputWrapperStyle } from './InputWrapperStyles';

export const InputWrapper: FC<BlockProps> = ({ children, ...rest }) => {
  return <InputWrapperStyle {...rest}>{children}</InputWrapperStyle>;
};
