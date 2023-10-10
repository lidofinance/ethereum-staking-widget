import React, { FC } from 'react';

import { trackEvent } from '@lidofinance/analytics-matomo';
import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

interface WrapFaqProps {
  faqList?: FAQItem[];
}

export const WrapFaq: FC<WrapFaqProps> = ({ faqList }) => {
  return (
    <NoSSRWrapper>
      <Section title="FAQ">
        <FaqAccordion
          faqList={faqList}
          onLinkClick={({ questionId, question, linkContent }) => {
            const actionEvent = `Push «${linkContent}» in FAQ ${question} on stake widget`;
            // Make event like `<project_name>_faq_<page_id>_<question_id>_<link_content>`
            const nameEvent = `eth_widget_faq_wrapOrUnwrap_${questionId}_${linkContent}`;
            trackEvent('Ethereum_Staking_Widget', actionEvent, nameEvent);
          }}
        />
      </Section>
    </NoSSRWrapper>
  );
};
