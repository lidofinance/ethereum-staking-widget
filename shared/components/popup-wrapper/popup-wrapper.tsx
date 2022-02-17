import { Link } from '@lidofinance/lido-ui';
import React, { FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import {
  Action,
  ActionsWrapper,
  Content,
  Data,
  DismissButton,
  LayoutContainer,
  PaddedAction,
  Wrapper,
} from './styles';

interface PopupWrapperProps {
  rate: string;
  open: boolean;
  icon: string;
  onClose: () => void;
  providerLink: string;
  providerName: string;
}

export const PopupWrapper: FC<PopupWrapperProps> = ({
  rate,
  open,
  icon,
  onClose,
  providerLink,
  providerName,
}) => {
  return (
    <LayoutContainer>
      <CSSTransition
        in={open}
        unmountOnExit
        mountOnEnter
        appear
        timeout={300}
        classNames="slide"
      >
        <Wrapper>
          <Content>
            <img src={icon} alt="" />
            <Data>
              <p className="label">
                Rate at <Link href={providerLink}>{providerName}</Link>
              </p>
              <p className="rate">1 ETH = {rate || 1} stETH</p>
            </Data>
          </Content>
          <ActionsWrapper>
            <Action>
              <DismissButton onClick={onClose} variant="ghost" size="xs">
                Dismiss
              </DismissButton>
            </Action>
            <PaddedAction>
              <Link href={providerLink}>Go to {providerName}</Link>
            </PaddedAction>
          </ActionsWrapper>
        </Wrapper>
      </CSSTransition>
    </LayoutContainer>
  );
};
