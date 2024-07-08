import React from 'react';
import { ExternalLinkIconFooter, FooterLink } from './styles';

export const ExternalLink = ({
  children,
  ...props
}: React.ComponentProps<typeof FooterLink>) => (
  <FooterLink target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <ExternalLinkIconFooter />
  </FooterLink>
);
