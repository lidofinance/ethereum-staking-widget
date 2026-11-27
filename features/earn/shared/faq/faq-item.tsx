import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Accordion } from '@lidofinance/lido-app-ui';

import { useInpageNavigation } from 'providers/inpage-navigation';

import { useFaqGroup } from './faq-group';
import { FaqAnswer } from './styles';

type FaqItemProps = {
  summary: ReactNode;
  id?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

export const FaqItem = ({
  summary,
  id,
  defaultExpanded,
  children,
}: FaqItemProps) => {
  const { hashNav, resetSpecificAnchor } = useInpageNavigation();
  const { activeItemHash, wasHashControlled } = useFaqGroup();
  const isHashTarget = !!id && hashNav === id;

  // When a hash targets an item in this group, only that item opens.
  // After hash navigation, all items stay closed, also the defaultExpanded one.
  const [expanded, setExpanded] = useState(() =>
    activeItemHash ? isHashTarget : !wasHashControlled && !!defaultExpanded,
  );

  useEffect(() => {
    if (isHashTarget) setExpanded(true);
  }, [isHashTarget]);

  // The FAQ drawer mounts the items only after the hash changes,
  // so the in-page navigation cannot find the element. Scroll to it here.
  useEffect(() => {
    if (!isHashTarget || !id) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [id, isHashTarget]);

  const handleExpandedChange = useCallback(
    (nextExpanded: boolean) => {
      setExpanded(nextExpanded);
      if (!nextExpanded && id) resetSpecificAnchor(id);
    },
    [id, resetSpecificAnchor],
  );

  return (
    <Accordion
      id={id}
      title={summary}
      expanded={expanded}
      onExpandedChange={handleExpandedChange}
    >
      <FaqAnswer>{children}</FaqAnswer>
    </Accordion>
  );
};
