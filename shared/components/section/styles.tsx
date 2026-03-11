import styled from 'styled-components';

export const SectionStyle = styled.section<{ $noMargin?: boolean }>`
  margin: ${({ $noMargin, theme }) => ($noMargin ? 0 : theme.spaceMap.xxl)}px 0;
`;

export const SectionHeaderStyle = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: ${({ theme }) => theme.fontSizesMap.xxs}px;
`;

export const SectionTitleStyle = styled.h2`
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizesMap.md}px;
  line-height: 1.3em;
  margin-right: auto;
`;

export const SectionHeaderDecoratorStyle = styled.div`
  margin-left: ${({ theme }) => theme.spaceMap.lg}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.5em;
`;

export const SectionContentStyle = styled.div``;
