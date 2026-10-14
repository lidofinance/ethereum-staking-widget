import styled from 'styled-components';
import { ThemeName } from '@lidofinance/lido-ui';
import { ReactComponent as InfoIcon } from 'assets/icons/info-hint.svg';

export const BannerStyled = styled.div`
  background-color: ${({ theme }) => (theme.name === ThemeName.light ? '#f2f3f5' : 'var(--custom-background-dark)')};
  border-radius: ${(props) => props.theme.borderRadiusesMap.lg}px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: ${(props) => props.theme.spaceMap.md}px;

  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizesMap.xxs}px;
`;

export const BannerHeader = styled.h4`
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spaceMap.xs}px;
`;

export const InfoIconStyled = styled(InfoIcon)`
  path {
    &[fill='#273852'] {
      fill: ${({ theme }) => (theme.name === 'dark' ? '#fff' : 'var(--custom-fill-dark)')};
    }
  }
`;
