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
})`
  font-size: 26px;
  text-align: center;
  margin: 12px 0 28px;
  text-wrap: balance;
`;

export const WarningSubText = styled(Text).attrs({
  weight: 400,
  size: 'xs',
  color: 'secondary',
})`
  text-align: center;
  margin: 0;
  margin-top: 12px;
  text-wrap: wrap;
`;
