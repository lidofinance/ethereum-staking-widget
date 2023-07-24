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
    <Wrap>
      {icon}
      <Title>{title}</Title>
      <Description>{description}</Description>
      {footerHint && <FooterHint>{footerHint}</FooterHint>}
      {footer && <Footer>{footer}</Footer>}
    </Wrap>
  );
});
