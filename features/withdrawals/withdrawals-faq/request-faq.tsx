import React, { FC } from 'react';

import { FaqAccordion, PageFAQ, isPageFAQ } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

type RequestFaqProps = {
  pageFAQ?: PageFAQ;
};

export const RequestFaq: FC<RequestFaqProps> = ({ pageFAQ }) => {
  if (!pageFAQ || !isPageFAQ(pageFAQ)) {
    return null;
  }

  return (
    <>
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

        {/* <ButtonLinkWrap
        target="_blank"
        rel="noopener noreferrer"
        href={LEARN_MORE_LINK}
      >
        <Button>Learn more</Button>
      </ButtonLinkWrap> */}
      </Section>
    </>
  );
};
