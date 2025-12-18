import styled from 'styled-components';

import { HolidaysTopLeftSVG, HolidaysTopRightSVG } from 'assets/holidays';
import { devicesHeaderMedia } from 'styles/global';

export const StyledHolidaysTopLeft = styled(HolidaysTopLeftSVG)`
  position: absolute;
  top: 47px;
  left: 8px;
  width: 311px;
  height: 179px;

  @media ${devicesHeaderMedia.mobile} {
    width: 160px;
    height: auto;
    left: 0;
  }
`;

export const StyledHolidaysTopRight = styled(HolidaysTopRightSVG)`
  position: absolute;
  bottom: -100px;
  right: 0;
  width: 245px;
  height: 118px;

  @media ${devicesHeaderMedia.mobile} {
    width: 150px;
    height: auto;
    top: 67px;
    right: 0px;
  }
`;

export const HolidaysDecorBottomFlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;
