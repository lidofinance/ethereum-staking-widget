import styled from 'styled-components';

export type BackgroundColorsType = 'balancer' | 'curve' | 'nft';

const backgroundMap = {
  balancer:
    'radial-gradient(100% 459.2% at 0% 0%,#696785 0%,#2c2b30 47.68%,#1f1f1f 100%)',
  curve:
    'radial-gradient(100% 459.2% at 0% 0%,#707bb2 0%,#405e9e 45.71%,#325698 100%)',
  nft: '#27272E',
};

export const Wrapper = styled.div<{ $background: BackgroundColorsType }>`
  position: relative;
  height: 80px;
  display: flex;
  text-align: left;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  overflow: hidden;
  background: ${({ $background }) => backgroundMap[$background]};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  position: relative;
  white-space: nowrap;
  margin-right: 8px;

  span {
    max-width: 40px;
  }
`;

export const ButtonWrap = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
`;
