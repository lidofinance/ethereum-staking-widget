import React, { FC } from 'react';

import { FaqAccordion } from '@lidofinance/ui-faq';

import { Section } from 'shared/components';
import { useUpdatableFaq } from 'shared/hooks/use-faq-on-client';
import { faqAccordionOnLinkClick } from 'utils/faq-matomo';
import { FaqWithMeta } from 'utils/faq';
// import { ButtonLinkWrap } from './styles';

// TODO: Replace this link when it will be finalized
// const LEARN_MORE_LINK =
//   'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

type RequestFaqProps = {
  faqWithMeta: FaqWithMeta;
};

export const RequestFaq: FC<RequestFaqProps> = ({ faqWithMeta }) => {
  const { data: pageFAQ } = useUpdatableFaq(faqWithMeta);
  if (!pageFAQ) return null;

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
