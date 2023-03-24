import { FC, ReactNode } from 'react';

import { BackgroundColorsType, Wrapper, TextWrap, ButtonWrap } from './styles';

type BannerProps = {
  icon: ReactNode;
  button: ReactNode;
  background: BackgroundColorsType;
};

export const Banner: FC<BannerProps> = (props) => {
  const { icon, button, children, background } = props;

  return (
    <Wrapper $background={background}>
      {icon}
      <TextWrap>{children}</TextWrap>
      <ButtonWrap>{button}</ButtonWrap>
    </Wrapper>
  );
};
