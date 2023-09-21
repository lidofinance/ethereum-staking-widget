import React, { useEffect, useState } from 'react';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { FaqAccordion, getFAQ, PageFAQ } from '@lidofinance/ui-faq';
import { dynamics } from 'config';
import { Section } from 'shared/components';

export const WrapFaq = () => {
  const [foundPage, setFoundPage] = useState<PageFAQ | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      try {
        const pageIdentification = 'wrapOrUnwrap';
        const pages = await getFAQ(dynamics.faqContentUrl);

        setFoundPage(
          pages.find(
            (page: PageFAQ) => page['identification'] === pageIdentification,
          ),
        );

        return () => {};
      } catch {
        // noop
      }
    })();
  }, []);

  return (
    <Section title="FAQ">
      <FaqAccordion
        faqList={foundPage?.faq}
        onLinkClick={({ questionId, question, linkContent }) => {
          const actionEvent = `Push «${linkContent}» in FAQ ${question} on stake widget`;
          // Make event like `<project_name>_faq_<page_id>_<question_id>_<link_content>`
          const nameEvent = `eth_widget_faq_wrapOrUnwrap_${questionId}_${linkContent}`;
          trackEvent('Ethereum_Staking_Widget', actionEvent, nameEvent);
        }}
      />
    </Section>
  );
};
