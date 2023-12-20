import React, { FC } from 'react';

import { FaqAccordion, PageFAQ, isPageFAQ } from '@lidofinance/ui-faq';

import { FAQ_WRAP_AND_UNWRAP_PAGE_PATH } from 'config';
import { Section } from 'shared/components';
import { useUpdatableFaq } from 'shared/hooks/use-faq-on-client';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';

type WrapFaqProps = {
  pageFAQ?: PageFAQ;
  eTag?: string | null;
};

export const WrapFaq: FC<WrapFaqProps> = ({ pageFAQ, eTag }) => {
  // This hook actual on IPFS only (see: the `eTag` prop drilling)!
  const { data: pageFaqIpfsMode } = useUpdatableFaq(
    FAQ_WRAP_AND_UNWRAP_PAGE_PATH,
    eTag,
  );

  if (!pageFAQ || (!isPageFAQ(pageFAQ) && !pageFaqIpfsMode)) {
    return null;
  }

  return (
    <>
      <Section title="FAQ">
        <FaqAccordion
          faqList={pageFaqIpfsMode?.faq || pageFAQ?.faq}
          onLinkClick={(props) => {
            faqAccordionOnLinkClick({
              pageId:
                pageFaqIpfsMode?.pageIdentification ||
                pageFAQ?.pageIdentification,
              ...props,
            });
          }}
        />
      </Section>
    </>
  );
};
