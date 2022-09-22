import { FC } from 'react';

import { BannerBoxStyle } from './styles';

export const BannerBox: FC = ({ children }) => {
  return <BannerBoxStyle>{children}</BannerBoxStyle>;
};
