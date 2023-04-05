import styled from 'styled-components';

export const NoBr = styled.span`
  white-space: nowrap;
`;

export const ButtonLinkWrap = styled.a`
  margin: ${({ theme }) => theme.spaceMap.xxl}px auto 0;
  display: block;
  width: fit-content;
`;
