import styled from 'styled-components';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const AccordionTransparentStyled = styled(AccordionTransparent)`
  overflow: visible;

  /*
    Disabling pointer-events while animation is in progress,
    fixes issue with card shadow on hover caused by inline overflow:hidden during animation
  */
  &[data-animating] * {
    pointer-events: none;
  }
`;

export const ListSubtitle = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spaceMap.xl}px;
  font-weight: 400;
`;

export const ListWrapper = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;

export const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const AccordionTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  padding: ${({ theme }) => theme.spaceMap.xl}px 0;
`;
