import styled from 'styled-components';
import OpenOcean from 'assets/icons/open-ocean.svg';
import Paraswap from 'assets/icons/paraswap-circle.svg';
import Oneinch from 'assets/icons/oneinch-circle.svg';

export const OpenOceanIcon = styled.img.attrs({
  src: OpenOcean,
  alt: 'openOcean',
})`
  display: block;
`;

export const ParaSwapIcon = styled.img.attrs({
  src: Paraswap,
  alt: 'paraswap',
})`
  display: block;
`;

export const OneInchIcon = styled.img.attrs({
  src: Oneinch,
  alt: '1inch',
})`
  display: block;
`;
