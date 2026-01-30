import { FC, PropsWithChildren } from 'react';

import { Widget } from './widget/widget';

import { UpgradeAssetsBlock } from './upgrade-assets';
import { FixedBlock, RightColumnContent, RightColumnStyled } from './styles';

export const RightColumn: FC<PropsWithChildren> = ({ children }) => {
  return (
    <RightColumnStyled>
      <FixedBlock>
        <RightColumnContent>
          <UpgradeAssetsBlock />
          <Widget />
        </RightColumnContent>
        {children}
      </FixedBlock>
    </RightColumnStyled>
  );
};
