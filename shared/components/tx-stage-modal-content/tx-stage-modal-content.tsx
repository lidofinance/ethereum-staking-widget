import { memo } from 'react';
import { Wrap, Title, Description, Footer, FooterHint } from './styles';

type TxStageModalContentProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  footerHint?: React.ReactNode;
  footer?: React.ReactNode;
};

export const TxStageModalContent = memo((props: TxStageModalContentProps) => {
  const { icon, title, description, footerHint, footer } = props;

  return (
    <Wrap data-testid="txStage">
      {icon}
      <Title data-testid="title">{title}</Title>
      <Description data-testid="description">{description}</Description>
      {footerHint && (
        <FooterHint data-testid="footerHint">{footerHint}</FooterHint>
      )}
      {footer && <Footer data-testid="footer">{footer}</Footer>}
    </Wrap>
  );
});
