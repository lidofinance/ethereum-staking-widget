import styled from 'styled-components';

export const ButtonLink = styled.a`
  display: block;
  text-decoration: none;
  text-align: center;
  line-height: 1em;
  box-sizing: border-box;
  margin: 0;
  border: none;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  font-family: inherit;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: 21px 44px;
  min-width: 120px;
  color: ${({ theme }) => theme.colors.primaryContrast};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryContrast} !important;
  :not(:disabled):hover,
  :focus-visible {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
`;

export const GreenSpan = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-size: large;
  font-weight: bold;
`;
