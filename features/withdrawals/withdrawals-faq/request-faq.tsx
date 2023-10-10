import React, { FC } from 'react';

// import { Button } from '@lidofinance/lido-ui';
import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';
import { trackEvent } from '@lidofinance/analytics-matomo';

import { Section } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

type RequestFaqProps = {
  faqList?: FAQItem[];
};

export const RequestFaq: FC<RequestFaqProps> = ({ faqList }) => {
  return (
    <NoSSRWrapper>
      <Section title="FAQ">
        <FaqAccordion
          faqList={faqList}
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
    </NoSSRWrapper>
  );
};
