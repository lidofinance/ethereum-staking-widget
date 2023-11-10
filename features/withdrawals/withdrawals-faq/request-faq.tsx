import React, { FC } from 'react';

import { FaqAccordion, FAQItem } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

type RequestFaqProps = {
  faqList?: FAQItem[];
};

export const RequestFaq: FC<RequestFaqProps> = ({ faqList }) => {
  return (
    <>
      {faqList && (
        <Section title="FAQ">
          <FaqAccordion
            faqList={faqList}
            onLinkClick={(props) => {
              faqAccordionOnLinkClick({
                pageId: 'withdrawalsRequest',
                ...props,
              });
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
      )}
    </>
  );
};
