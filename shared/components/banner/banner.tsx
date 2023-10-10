import { FC, PropsWithChildren, ReactNode } from 'react';

import { BackgroundColorsType, Wrapper, TextWrap, ButtonWrap } from './styles';

type BannerProps = {
  icon: ReactNode;
  button: ReactNode;
  background: BackgroundColorsType;
};

export const Banner: FC<PropsWithChildren<BannerProps>> = (props) => {
  const { icon, button, children, background, ...rest } = props;

  return (
    <Wrapper $background={background} {...rest}>
      {icon}
      <TextWrap>{children}</TextWrap>
      <ButtonWrap>{button}</ButtonWrap>
    </Wrapper>
  );
};
