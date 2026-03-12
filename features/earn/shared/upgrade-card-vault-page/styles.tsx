import styled, { css } from 'styled-components';
import { Block, Button } from '@lidofinance/lido-ui';

export const UpgradeCardBlock = styled(Block)`
  ${({ theme }) =>
    theme.name === 'light'
      ? css`
          background: linear-gradient(135deg, #f5f3ff 0%, #fef1f6 100%);
          border: 1px solid rgba(201, 172, 255, 0.7);
        `
      : css`
          background: linear-gradient(
              87.27deg,
              rgba(106, 154, 255, 0.2) -11.77%,
              rgba(201, 172, 255, 0.2) 21.01%,
              rgba(255, 206, 190, 0.2) 102.78%
            ),
            #27272e;
          border: 1px solid #c9acff;
        `}
  color: var(--lido-color-text);
  max-width: 680px;
  padding: 24px;
  margin-bottom: 8px;
`;

export const UpgradeHeader = styled.div`
  grid-area: header;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const UpgradeContent = styled.div<{
  $altLayout?: boolean;
  $hasDescription?: boolean;
}>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 142px;
  grid-template-areas: ${({ $altLayout, $hasDescription }) =>
    $altLayout
      ? `
        "header    header"
        "features  image"
        ${$hasDescription ? '"desc      image"' : ''}
      `
      : `
        "header    image"
        "features  image"
        ${$hasDescription ? '"desc      image"' : ''}
      `};

  align-items: start;
  column-gap: 32px;
  row-gap: 24px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;
  }
`;

export const UpgradeColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  width: 100%;
`;

export const UpgradeTitle = styled.h3`
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 38px;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 20px;
    line-height: 28px;
  }
`;

export const UpgradeSubtitle = styled.p`
  margin: 0;
`;

export const UpgradeList = styled.div`
  grid-area: features;
  display: grid;
  gap: 12px;
`;

export const UpgradeItem = styled.div`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
`;

export const UpgradeItemIcon = styled.span`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  color: var(--lido-color-text);
`;

export const UpgradeDescription = styled.p`
  grid-area: desc;
`;

export const UpgradeIllustrationSlot = styled.div`
  grid-area: image;
  display: grid;
  place-items: center start;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;

export const UpgradeButton = styled(Button)`
  margin-top: 24px;
`;
