import styled, { css } from 'styled-components';
import { Button, Link } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';

const buttonLinkWrapCss = css`
  display: block;

  ${({ theme }) => theme.mediaQueries.md} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonLinkWrap = styled(Link)`
  ${buttonLinkWrapCss};
`;

export const ButtonLinkWrapLocal = styled(LocalLink)`
  ${buttonLinkWrapCss};
`;

export const ButtonStyle = styled(Button)`
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;
