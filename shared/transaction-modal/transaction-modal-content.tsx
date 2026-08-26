import { memo } from 'react';
import styled from 'styled-components';
import { Text } from '@lidofinance/lido-ui';

export const Wrap = styled.div`
  text-align: center;
  margin-top: -34px;

  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: -26px;
    padding-bottom: 12px;
  }
`;

export const Title = styled(Text).attrs({
  size: 'sm',
})`
  margin-top: ${({ theme }) => theme.spaceMap.xxl}px;
  font-weight: 800;
  text-align: center;
`;

export const DescriptionText = styled(Text).attrs({
  size: 'xs',
  color: 'secondary',
})`
  text-align: center;
  // lets error messages carry a second line without any markup
  white-space: pre-line;
`;

export const Description = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.xs}px;
  text-align: center;
`;

export const Footer = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.xxl}px;
`;

export const FooterHint = styled.div`
  text-align: center;
  margin: calc(${({ theme }) => theme.spaceMap.xxl}px + 12px) 0 12px;
`;

export const FooterHintText = styled(Text).attrs({
  size: 'xxs',
  color: 'secondary',
})`
  text-align: center;
`;

type TransactionModalContentProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  footerHint?: React.ReactNode;
  footer?: React.ReactNode;
};

export const TransactionModalContent = memo(
  ({
    icon,
    title,
    description,
    footerHint,
    footer,
  }: TransactionModalContentProps) => {
    return (
      <Wrap data-testid="txStage">
        {icon}
        <Title data-testid="title">{title}</Title>
        <Description data-testid="description">
          {typeof description === 'string' ? (
            <DescriptionText>{description}</DescriptionText>
          ) : (
            description
          )}
        </Description>
        {footerHint && (
          <FooterHint data-testid="footerHint">
            {typeof footerHint === 'string' ? (
              <FooterHintText>{footerHint}</FooterHintText>
            ) : (
              footerHint
            )}
          </FooterHint>
        )}
        {footer && <Footer data-testid="footer">{footer}</Footer>}
      </Wrap>
    );
  },
);
