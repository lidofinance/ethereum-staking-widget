import styled from 'styled-components';
import WarningIconSrc from 'assets/icons/attention-triangle-ipfs.svg';
import { Text } from '@lidofinance/lido-ui';

export const WarningIcon = styled.img.attrs({
  src: WarningIconSrc,
  alt: 'warning',
})`
  display: block;
  width: 58px;
  height: 51px;
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  padding: 0px;

  button {
    white-space: unset;
  }

  a {
    align-self: stretch;
    width: 100%;
  }
`;

export const WarningText = styled(Text).attrs({
  weight: 700,
  size: 'lg',
})`
  text-align: center;
  margin: 12px 0 28px;
  text-wrap: balance;
`;
