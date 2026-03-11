import { Question, Tooltip } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const StyledTooltip = styled(Tooltip)`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px !important;
  margin-top: 8px;
`;

export const StyledQuestionIcon = styled(Question)`
  margin-left: 4px;
  width: 20px;
  height: 20px;
`;

export const SubmitButtonInnerContainer = styled.div`
  display: flex;
  align-items: center;
  height: 20px;
  text-align: center;
`;
