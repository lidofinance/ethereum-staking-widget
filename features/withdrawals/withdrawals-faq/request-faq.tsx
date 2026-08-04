import { useMatomoEventHandle } from 'shared/hooks';

import { Section } from 'shared/components';

import { FaqList } from './faq-list';
import { REQUEST_FAQ, REQUEST_FAQ_DYNAMIC_AFTER } from './faq-data';
import { UnstakeAmountBoundaries } from './list/unstake-amount-boundaries';

// Content lives in faq-data.ts (single source with the SEO prerender).
// The min/max-amounts entry stays a React component — its numbers come
// from a live contract read — and slots in at its historical position.
const dynamicAt =
  REQUEST_FAQ.findIndex(
    (entry) => entry.question === REQUEST_FAQ_DYNAMIC_AFTER,
  ) + 1;

export const RequestFaq: React.FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <FaqList entries={REQUEST_FAQ.slice(0, dynamicAt)} />
      <UnstakeAmountBoundaries />
      <FaqList entries={REQUEST_FAQ.slice(dynamicAt)} />
    </Section>
  );
};
