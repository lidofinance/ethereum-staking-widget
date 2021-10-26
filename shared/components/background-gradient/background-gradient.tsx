import {
  BackgroundGradientSvgStyle,
  BackgroundGradientStartStyle,
  BackgroundGradientStopStyle,
} from './styles';
import { Component } from 'types';

export type BackgroundGradientComponent = Component<
  'svg',
  { width: number; height: number }
>;

// svg gradient looks better than css gradient in some browsers

export const BackgroundGradient: BackgroundGradientComponent = (props) => {
  const { width, height, ...rest } = props;

  return (
    <BackgroundGradientSvgStyle width={width} height={height} {...rest}>
      <radialGradient id="background-gradient" cx="50%" y="50%">
        <BackgroundGradientStartStyle offset="0%" />
        <BackgroundGradientStopStyle offset="100%" />
      </radialGradient>
      <rect
        width={width}
        height={height}
        opacity=".1"
        fill="url(#background-gradient)"
      />
    </BackgroundGradientSvgStyle>
  );
};
