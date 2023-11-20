import React, { FC } from 'react';

import { FaqAccordion, PageFAQ } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

type ClaimFaqProps = {
  pageFAQ?: PageFAQ;
};

export const ClaimFaq: FC<ClaimFaqProps> = ({ pageFAQ }) => {
  return (
    <>
      {pageFAQ && pageFAQ.faq && (
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
