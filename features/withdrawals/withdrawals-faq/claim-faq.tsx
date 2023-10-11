import React, { FC } from 'react';

import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

type ClaimFaqProps = {
  faqList?: FAQItem[];
};

export const ClaimFaq: FC<ClaimFaqProps> = ({ faqList }) => {
  return (
    <NoSSRWrapper>
      {faqList && (
        <Section title="FAQ">
          <FaqAccordion
            faqList={faqList}
            onLinkClick={(props) => {
              faqAccordionOnLinkClick({ pageId: 'withdrawalsClaim', ...props });
            }}
          />
        </Section>
      )}
    </NoSSRWrapper>
  );
};
