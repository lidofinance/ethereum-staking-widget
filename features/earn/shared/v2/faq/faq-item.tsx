import { AccordionTransparent } from '@lidofinance/lido-ui';
import { ComponentProps } from 'react';
import { FaqItemContainer } from './styles';

export const FaqItem = ({
  children,
  ...rest
}: ComponentProps<typeof AccordionTransparent>) => {
  return (
    <AccordionTransparent {...rest}>
      <FaqItemContainer>{children}</FaqItemContainer>
    </AccordionTransparent>
  );
};
