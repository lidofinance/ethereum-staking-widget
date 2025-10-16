import styled from 'styled-components';
import { Loader } from '@lidofinance/lido-ui';

export const LoaderWrapperStyle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 70;
  animation: wrapper-loader 0.1s ease-out 0.25s 1 both;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    background: ${({ theme }) => theme.colors.foreground};
  }

  @keyframes wrapper-loader {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export const ContentStyle = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export const LoaderStyle = styled(Loader)`
  position: relative;
  margin: 10px;
  background: ${({ theme }) => theme.colors.foreground};
`;

export const CenterLoaderStyle = styled(Loader)`
  position: absolute;
  margin: -12px;
  top: 50%;
  left: 50%;
`;
