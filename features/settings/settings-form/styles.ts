import styled from 'styled-components';

export const SettingsFormWrap = styled.div`
  margin-top: 42px;
  margin-bottom: 40px;
`;

export const Actions = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.lg}px;
  display: flex;
  gap: 10px;

  & > button {
    flex: 1 1 auto;
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

export const DescriptionText = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 500;
  line-height: 1.5;

  & p:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  }

  & a {
    text-decoration: none;
    color: var(--lido-color-primary);
  }
`;

export const DescriptionTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 800;
  line-height: 1.5;
  color: var(--lido-color-text);

  &:not(:first-child) {
    margin-top: ${({ theme }) => theme.spaceMap.md}px;
  }
`;
