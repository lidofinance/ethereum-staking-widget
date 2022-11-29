import { FC } from 'react';

import { WrapperStyle } from './InputDescriptionStyles';

export const InputDescription: FC = ({ children }) => {
  return <WrapperStyle>{children}</WrapperStyle>;
};
