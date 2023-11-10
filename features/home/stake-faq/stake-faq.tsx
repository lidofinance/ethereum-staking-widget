import React, { FC } from 'react';

import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

interface StakeFaqProps {
  faqList?: FAQItem[];
}

export const StakeFaq: FC<StakeFaqProps> = ({ faqList }) => {
  return (
    <>
      {faqList && (
        <Section title="FAQ">
          <FaqAccordion
            faqList={faqList}
            onLinkClick={(props) => {
              faqAccordionOnLinkClick({ pageId: 'stake', ...props });
            }}
          />
        </Section>
      )}
    </>
  );
};
