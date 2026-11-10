import { AccordionTransparent } from '@lidofinance/lido-ui';
import { ComponentProps, useCallback, useEffect } from 'react';
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
  const { activeItemHash, wasHashControlled } = useFaqGroup();

  const handleCollapse = useCallback(() => {
    if (id) resetSpecificAnchor(id);
    onCollapse?.();
  }, [resetSpecificAnchor, id, onCollapse]);

  // The FAQ tab mounts only after the hash changes, so navigateInpageAnchor
  // can't find the element yet. Scroll to it once it is the hash target.
  useEffect(() => {
    if (!id || hashNav !== id) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [id, hashNav]);

  // When a hash targets an item in this group, it fully controls expansion:
  // only the matching item opens, all others (including defaultExpanded ones) stay closed.
  // Once the hash is cleared after hash-navigation, keep all items closed
  // (prevent the defaultExpanded item from auto-opening again).
  // Without any prior hash navigation, fall back to the explicit prop.
  const effectiveDefaultExpanded = activeItemHash
    ? !!id && hashNav === id
    : wasHashControlled
      ? false
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
