import styled from 'styled-components';
import { Card } from '@lidofinance/lido-app-ui';

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const PanelCard = styled(Card)`
  && {
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }
`;

export const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-20);
  width: 100%;
  padding: var(--lido-app-ui-space-20);
  box-sizing: border-box;
`;

export const GlowWrapper = styled.span`
  position: absolute;
  top: -189px;
  right: -236px;
  z-index: -1;
  transform: rotate(8.48deg);
  pointer-events: none;

  & > svg {
    display: block;
  }
`;

export const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-20);
`;

export const PositionBox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-16);
  padding: var(--lido-app-ui-space-12) var(--lido-app-ui-space-16);
  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-md);
  background: var(--lido-app-ui-color-background-surface);
`;

export const PositionMain = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
`;

export const PositionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);
`;

export const PositionValue = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: var(--lido-app-ui-space-8);
`;
