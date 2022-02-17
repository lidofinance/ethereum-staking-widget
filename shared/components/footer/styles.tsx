import { Container, Divider } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const FooterStyle = styled((props) => <Container {...props} />)`
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-wrap: wrap;
  padding-top: 60px;
  padding-bottom: 20px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 40px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    padding-bottom: 40px;
  }
`;

export const FooterDividerStyle = styled((props) => <Divider {...props} />)`
  flex-basis: 100%;
  margin-bottom: 60px;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-bottom: 40px;
  }
`;

export const FooterLogoStyle = styled.div`
  flex-grow: 1;
  margin-bottom: 40px;
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-basis: 100%;
    order: 2;
  }
`;

export const FooterGroupStyle = styled.div`
  flex-grow: 1;
  margin-bottom: 40px;
  padding-right: 20px;

  &:last-child {
    padding-right: 0;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-basis: 100%;
  }
`;

export const FooterTitleStyle = styled.h4`
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  line-height: 1.4em;
  margin: 0 0 1em;
`;

export const FooterItemStyle = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 1.6em;
  margin: 0 0 0.8em;

  a {
    text-decoration: none;
    opacity: 0.7;

    &,
    &:hover,
    &:visited {
      color: ${({ theme }) => theme.colors.text};
    }

    &:hover {
      opacity: 1;
    }
  }
`;
