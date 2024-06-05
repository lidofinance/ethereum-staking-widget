import styled from 'styled-components';

export const Wrap = styled.div`
  position: relative;
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? '#28282f' : '#f2f3fc'};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

export const Icon = styled.div`
  margin-right: 15px;

  &,
  svg {
    display: block;
    weight: 75px;
    height: 75px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    &,
    svg {
      weight: 48px;
      height: 48px;
    }
  }
`;

export const Title = styled.div`
  text-align: left;
`;

export const TitleText = styled.div`
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: var(--lido-color-text);

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 16px;
    line-height: 24px;
  }
`;

export const TitleDescription = styled.div`
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  color: var(--lido-color-textSecondary);
`;

export const Strategies = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;

  ${({ theme }) => theme.mediaQueries.md} {
    /* justify-content: center; */
    display: grid;
    width: fit-content;
    grid-template-columns: repeat(3, auto);

    & > *:nth-child(4) {
      display: none;
    }
  }
`;

export const StrategyItem = styled.div`
  flex: 0 0 auto;
  text-align: left;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: var(--lido-color-text);

  b {
    font-weight: 700;
  }
`;

export const StrategyDivider = styled.div`
  svg {
    display: block;
    fill: ${({ theme }) =>
      theme.name === 'dark'
        ? 'var(--lido-color-text)'
        : 'var(--lido-color-textSecondary)'};
  }
`;
