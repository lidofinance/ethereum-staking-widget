import React, { FC } from 'react';

import { FaqAccordion, PageFAQ, isPageFAQ } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { useFetchFaqOnClientIfETagWereChanged } from 'shared/hooks/use-faq-on-client';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

type ClaimFaqProps = {
  pageFAQ?: PageFAQ;
  eTag?: string | null;
};

export const ClaimFaq: FC<ClaimFaqProps> = ({ pageFAQ, eTag }) => {
  // This hook actual on IPFS only (see: the `eTag` prop drilling)!
  const { data: pageFaqIpfsMode } = useFetchFaqOnClientIfETagWereChanged(
    '/faq-withdrawals-page-claim-tab.md',
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
      </Section>
    </>
  );
};
