import React, { FC } from 'react';

import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

interface StakeFaqProps {
  faqList?: FAQItem[];
}

export const StakeFaq: FC<StakeFaqProps> = ({ faqList }) => {
  return (
    <NoSSRWrapper>
      <Section title="FAQ">
        <FaqAccordion
          faqList={faqList}
          onLinkClick={(props) => {
            faqAccordionOnLinkClick({ pageId: 'stake', ...props });
          }}
        />
      </Section>
    </NoSSRWrapper>
  );
};
