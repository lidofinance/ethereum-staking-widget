import React, { FC } from 'react';
import { css } from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import { Link } from '@lidofinance/lido-ui';

import {
  LayoutContainer,
  Wrapper,
  Content,
  Data,
  ActionsWrapper,
  Action,
  DismissButton,
} from './styles';

interface PopupWrapperProps {
  rate: string;
  open: boolean;
  icon: string;
  onClose: () => void;
  providerLink: string;
  providerName: string;
}

const PopupWrapper: FC<PopupWrapperProps> = ({
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
            <Action
              css={css`
                padding: 8px 16px;
              `}
            >
              <Link href={providerLink}>Go to {providerName}</Link>
            </Action>
          </ActionsWrapper>
        </Wrapper>
      </CSSTransition>
    </LayoutContainer>
  );
};

export default PopupWrapper;
