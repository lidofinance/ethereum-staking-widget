import styled from 'styled-components';
import { InlineLoader } from '@lidofinance/lido-ui';

type FullWidthLoaderProps = {
  $height?: string;
  $borderRadius?: string;
};

export const FullWidthLoader = styled(InlineLoader)<FullWidthLoaderProps>`
  width: 100%;
  height: ${({ $height = '52px' }) => $height};
  border-radius: ${({ $borderRadius = '10px' }) => $borderRadius};
`;
