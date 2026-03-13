import { AccordionTransparent } from '@lidofinance/lido-ui';
import { ComponentProps, useCallback } from 'react';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { FaqItemContainer } from './styles';
import { useFaqGroup } from './faq-group';

export const FaqItem = ({
  children,
  id,
  onCollapse,
  defaultExpanded,
  ...rest
}: ComponentProps<typeof AccordionTransparent>) => {
  const { hashNav, resetSpecificAnchor } = useInpageNavigation();
  const { activeItemHash } = useFaqGroup();

  const handleCollapse = useCallback(() => {
    if (id) resetSpecificAnchor(id);
    onCollapse?.();
  }, [resetSpecificAnchor, id, onCollapse]);

  // When a hash targets an item in this group, it fully controls expansion:
  // only the matching item opens, all others (including defaultExpanded ones) stay closed.
  // Without an active hash, fall back to the explicit prop.
  const effectiveDefaultExpanded = activeItemHash
    ? !!id && hashNav === id
    : defaultExpanded;

  return (
    <AccordionTransparent
      id={id}
      defaultExpanded={effectiveDefaultExpanded}
      {...rest}
      onCollapse={handleCollapse}
    >
      <FaqItemContainer>{children}</FaqItemContainer>
    </AccordionTransparent>
  );
};
