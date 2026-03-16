import { FC, PropsWithChildren } from 'react';
import { FixedBlock, SidePanelContent, SidePanelStyled } from './styles';

export const SidePanel: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidePanelStyled>
      <FixedBlock>
        <SidePanelContent>{children}</SidePanelContent>
      </FixedBlock>
    </SidePanelStyled>
  );
};
