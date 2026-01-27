import { FC, PropsWithChildren } from 'react';

import { Widget } from './widget/widget';

import { UpgradeAssetsBlock } from './upgrade-assets';
import { RightColumnStyled } from './styles';

export const RightColumn: FC<PropsWithChildren> = ({ children }) => {
  return (
    <RightColumnStyled>
      <UpgradeAssetsBlock />
      <Widget />
      {children}
    </RightColumnStyled>
  );
};
