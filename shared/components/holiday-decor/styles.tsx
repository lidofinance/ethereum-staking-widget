import styled, { keyframes } from 'styled-components';

import {
  HolidaysTopLeftSVG,
  HolidaysTopRightSVG,
  HolidaysBottomLeftSVG,
  HolidaysBottomRightSVG,
} from 'assets/holidays';
import { devicesHeaderMedia } from 'styles/global';

export const StyledHolidaysTopLeft = styled(HolidaysTopLeftSVG)`
  position: absolute;
  top: 47px;
  left: 8px;
  width: 310px;
  height: 179px;
  overflow: visible;
  will-change: auto;

  @media ${devicesHeaderMedia.mobile} {
    width: 222px;
    height: auto;
    left: 0;
  }
`;

export const StyledHolidaysTopRight = styled(HolidaysTopRightSVG)`
  position: absolute;
  bottom: -100px;
  right: 0;
  width: 244px;
  height: 118px;
  overflow: visible;
  will-change: auto;

  @media ${devicesHeaderMedia.mobile} {
    width: 175px;
    height: auto;
    top: 62px;
    right: -10px;
  }
`;

export const HolidaysDecorBottomFlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: sticky;
  bottom: -6px;

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

export const HolidayDecorBottomWrapper = styled.div``;

export const StyledHolidaysBottomLeft = styled(HolidaysBottomLeftSVG)`
  filter: drop-shadow(0 -4px 8px rgba(173, 216, 230, 0.4))
    drop-shadow(0 -6px 12px rgba(135, 206, 235, 0.3));
  will-change: auto;
`;

export const StyledHolidaysBottomRight = styled(HolidaysBottomRightSVG)`
  filter: drop-shadow(0 -4px 8px rgba(173, 216, 230, 0.4))
    drop-shadow(0 -6px 12px rgba(135, 206, 235, 0.3));
  will-change: auto;
`;

export const glitter = keyframes`
  0%, 50%, 100% {
    transform: scale(1.0);
    opacity: 1;
  }
  25%, 75% {
    transform: scale(0.5);
    opacity: 0;
  }
`;

export const FourPointStar = styled.div<{
  bottom: number;
  left?: number;
  right?: number;
  animationDuration?: number;
  animationDelay?: number;
}>`
  position: absolute;
  bottom: ${({ bottom }) => bottom}px;
  left: ${({ left }) => (left !== undefined ? `${left}px` : 'unset')};
  right: ${({ right }) => (right !== undefined ? `${right}px` : 'unset')};
  width: 24px;
  height: 24px;
  display: inline-block;
  color: white;
  animation: ${glitter} ${({ animationDuration = 8 }) => animationDuration}s
    linear ${({ animationDelay = 0 }) => animationDelay}s infinite normal;
  filter: drop-shadow(0 0 3px rgba(173, 216, 230, 0.4))
    drop-shadow(0 0 6px rgba(135, 206, 235, 0.3))
    drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08));
  will-change: transform, opacity;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(240, 248, 255, 1) 50%,
      rgba(230, 243, 255, 1) 100%
    );
    clip-path: polygon(
      50% 0%,
      55% 45%,
      100% 50%,
      55% 55%,
      50% 100%,
      45% 55%,
      0% 50%,
      45% 45%
    );
    transform: translate(-50%, -50%);
  }
`;

export const FourPointStarSmall = styled(FourPointStar)`
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 2px rgba(173, 216, 230, 0.3))
    drop-shadow(0 0 4px rgba(135, 206, 235, 0.2))
    drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06));

  &:before {
    width: 16px;
    height: 16px;
  }
`;

export const FourPointStarLarge = styled(FourPointStar)`
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 4px rgba(173, 216, 230, 0.5))
    drop-shadow(0 0 8px rgba(135, 206, 235, 0.4))
    drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));

  &:before {
    width: 32px;
    height: 32px;
  }
`;
