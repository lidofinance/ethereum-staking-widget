import React, { FC } from 'react';

import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

interface WrapFaqProps {
  faqList?: FAQItem[];
}

export const WrapFaq: FC<WrapFaqProps> = ({ faqList }) => {
  return (
    <NoSSRWrapper>
      {faqList && (
        <Section title="FAQ">
          <FaqAccordion
            faqList={faqList}
            onLinkClick={(props) => {
              faqAccordionOnLinkClick({ pageId: 'wrapOrUnwrap', ...props });
            }}
          />
        </Section>
      )}
    </NoSSRWrapper>
  );
};
