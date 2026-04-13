import styled from 'styled-components';
import { InlineLoader, ThemeName } from '@lidofinance/lido-ui';
import ExternalLink from 'assets/icons/external-link-icon.svg';
import { ReactComponent as ChevronBlue } from 'assets/icons/chevron-blue.svg';

export const DexOptionsContainer = styled.div<{
  $maxElements: number;
}>`
  --itemHeight: 82px;
  --itemGap: 8px;

  display: flex;
  flex-direction: column;
  gap: var(--itemGap);
  overflow-y: hidden;
  max-height: calc(
    (var(--itemGap) + var(--itemHeight)) * ${({ $maxElements }) => $maxElements} - var(
        --itemGap
      )
  );
  transition: max-height 0.2s ease-in-out;

  ${({ theme }) => theme.mediaQueries.md} {
    max-height: unset;
  }
`;

export const DexOptionsShowMore = styled.button`
  display: flex;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }

  padding: 2px 16px;
  margin: 8px auto 0px;

  flex: 0 1;

  align-self: center;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;

  background: none;
  outline: none;
  border: none;
  color: var(--lido-color-primary);
  line-height: 20px;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
`;

export const DexOptionStyled = styled.div<{ $loading?: boolean }>`
  width: 100%;

  min-height: var(--itemHeight);
  max-height: var(--itemHeight);
  background-color: var(--custom-background-secondary);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: 16px 20px;

  display: grid;
  gap: 5px 16px;
  grid-template: 1fr 1fr / 44px max-content;

  & > svg,
  & > img {
    grid-row: 1 / 3;
    grid-column: 1 / 1;
    align-self: center;
    width: 44px;
    filter: ${({ theme }) =>
      theme.name === ThemeName.light
        ? 'drop-shadow(0px 0px 1px rgba(246, 248, 250, 255))'
        : 'unset'};
  }
`;

export const DexOptionLoader = styled(InlineLoader)`
  display: block;
  width: 100%;
  min-height: 82px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
`;

export const DexOptionBlockTitle = styled.span`
  grid-row: 1;
  grid-column: 2;
  color: var(--lido-color-text);
  font-weight: 400;
  font-size: 14px;
`;

export const DexOptionBlockLink = styled.a`
  grid-row: 2;
  grid-column: 2;
  &::after {
    content: ' ';
    display: inline-block;
    background: url(${ExternalLink}) center / contain no-repeat;
    width: 12px;
    height: 12px;
    margin-left: 8px;
    margin-bottom: -1px;
  }
`;

export const DexOptionAmount = styled.span`
  grid-row: 1 / 3;
  grid-column: 3;
  width: 100%;
  justify-self: end;
  align-self: center;
  text-align: end;

  color: var(--lido-color-text);
  font-weight: 700;
  font-size: 14px;
`;

export const DexWarning = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  font-weight: 400;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  background-color: var(--custom-background-secondary);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;

  svg {
    display: block;
    margin-right: ${({ theme }) => theme.spaceMap.xs}px;
  }
`;

export const DexOptionsCheckMarkIcon = styled(ChevronBlue)<{
  $active?: boolean;
}>`
  transition: transform 0.3s ease-in-out;
  transform: rotateY(180deg);
  transform: ${({ $active }) =>
    $active ? 'rotateZ(180deg)' : 'rotateZ(0deg)'};
`;
