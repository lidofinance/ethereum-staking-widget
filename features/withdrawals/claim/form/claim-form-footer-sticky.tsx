import { FC, PropsWithChildren } from 'react';

import {
  ClaimFooterBodyEnder,
  ClaimFormFooter,
  ClaimFormFooterWrapper,
} from './styles';

type ClaimFormFooterStickyProps = {
  isEnabled: boolean;
};

export const ClaimFormFooterSticky: FC<
  PropsWithChildren<ClaimFormFooterStickyProps>
> = ({ isEnabled, children }) => {
  return (
    <ClaimFormFooterWrapper isSticked={isEnabled}>
      <ClaimFormFooter>
        <ClaimFooterBodyEnder>
          <div />
          <div />
          <div />
        </ClaimFooterBodyEnder>
        {children}
      </ClaimFormFooter>
    </ClaimFormFooterWrapper>
  );
};
