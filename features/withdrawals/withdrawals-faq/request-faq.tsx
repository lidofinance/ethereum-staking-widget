// import { Button } from '@lidofinance/lido-ui';
import React, { useEffect, useState } from 'react';
import { FaqAccordion, getFAQ, PageFAQ } from '@lidofinance/ui-faq';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { dynamics } from 'config';
import { Section } from 'shared/components';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

export const RequestFaq: React.FC = () => {
  const [foundPage, setFoundPage] = useState<PageFAQ | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      try {
        const pageIdentification = 'withdrawals-request';
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
          const nameEvent = `eth_widget_faq_withdrawalsRequest_${questionId}_${linkContent}`;
          trackEvent('Ethereum_Staking_Widget', actionEvent, nameEvent);
        }}
      />

      {/* <ButtonLinkWrap
        target="_blank"
        rel="noopener noreferrer"
        href={LEARN_MORE_LINK}
      >
        <Button>Learn more</Button>
      </ButtonLinkWrap> */}
    </Section>
  );
};
