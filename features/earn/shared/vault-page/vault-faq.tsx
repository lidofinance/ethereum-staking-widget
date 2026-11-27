import { useEffect, useState, type ReactNode } from 'react';

import { useInpageNavigation } from 'providers/inpage-navigation';

import { FaqDrawer } from '../faq';

import { CTA_BAR_FAB_RAISE } from './vault-cta-bar';

// '#faq' and every '#faq-…' item hash open the drawer
export const isFaqHash = (hash?: string) =>
  !!hash && (hash === 'faq' || hash.startsWith('faq-'));

type VaultFaqProps = {
  children: ReactNode;
  // the floating bar is visible, so the FAQ button moves up to its middle
  raised: boolean;
};

export const VaultFaq = ({ children, raised }: VaultFaqProps) => {
  const { hashNav, resetInpageAnchor } = useInpageNavigation();
  const isHashOpen = isFaqHash(hashNav);
  const [isOpen, setIsOpen] = useState(isHashOpen);

  useEffect(() => {
    if (isHashOpen) setIsOpen(true);
  }, [isHashOpen, hashNav]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // a closed drawer must not reopen on the next render
    if (!open && isHashOpen) resetInpageAnchor();
  };

  return (
    <FaqDrawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      raiseBy={raised ? CTA_BAR_FAB_RAISE : undefined}
    >
      {children}
    </FaqDrawer>
  );
};
