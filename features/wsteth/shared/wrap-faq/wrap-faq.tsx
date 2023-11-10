import React, { FC } from 'react';

import { FaqAccordion, PageFAQ } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

interface WrapFaqProps {
  pageFAQ?: PageFAQ;
}

export const WrapFaq: FC<WrapFaqProps> = ({ pageFAQ }) => {
  return (
    <>
      {pageFAQ && (
        <Section title="FAQ">
          <FaqAccordion
            faqList={pageFAQ.faq}
            onLinkClick={(props) => {
              faqAccordionOnLinkClick({
                pageId: pageFAQ.pageIdentification,
                ...props,
              });
            }}
          />
        </Section>
      )}
    </>
  );
};
