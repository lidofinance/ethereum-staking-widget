import React from 'react';
import { Curve, Balancer } from 'shared/banners';

import { Wrapper, TextStyles, DescStyles } from './styles';

export const ModalPoolBanners = () => {
  return (
    <Wrapper>
      <TextStyles>
        <b>Earn more</b>
        <DescStyles>
          Explore DeFi options below to get even bigger rewards
        </DescStyles>
      </TextStyles>
      <Curve />
      <Balancer />
    </Wrapper>
  );
};
