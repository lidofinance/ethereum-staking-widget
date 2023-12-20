import React, { FC } from 'react';

import { FaqAccordion, PageFAQ, isPageFAQ } from '@lidofinance/ui-faq';

import { FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH } from 'config';
import { Section } from 'shared/components';
import { useUpdatableFaq } from 'shared/hooks/use-faq-on-client';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

type RequestFaqProps = {
  pageFAQ?: PageFAQ;
  eTag?: string | null;
};

export const RequestFaq: FC<RequestFaqProps> = ({ pageFAQ, eTag }) => {
  // This hook actual on IPFS only (see: the `eTag` prop drilling)!
  const { data: pageFaqIpfsMode } = useUpdatableFaq(
    FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH,
    eTag,
  );

  if (!pageFAQ || (!isPageFAQ(pageFAQ) && !pageFaqIpfsMode)) {
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
