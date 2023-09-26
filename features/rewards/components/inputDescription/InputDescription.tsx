import { FC, PropsWithChildren } from 'react';

import { WrapperStyle } from './InputDescriptionStyles';

export const InputDescription: FC<PropsWithChildren> = ({ children }) => {
  return <WrapperStyle>{children}</WrapperStyle>;
};
