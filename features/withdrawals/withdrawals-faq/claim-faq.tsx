import { useMatomoEventHandle } from 'shared/hooks';

import { Section } from 'shared/components';

import { FaqList } from './faq-list';
import { CLAIM_FAQ } from './faq-data';

// Content lives in faq-data.ts (single source with the SEO prerender).
export const ClaimFaq: React.FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <FaqList entries={CLAIM_FAQ} />
    </Section>
  );
};
