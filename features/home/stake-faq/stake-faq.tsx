import { FC, useEffect, useState } from 'react';
import { FaqAccordion, getFAQ, PageFAQ } from '@lidofinance/ui-faq';
import { dynamics } from 'config';
import { Section } from 'shared/components';
import { useMatomoEventHandle } from 'shared/hooks';

export const StakeFaq: FC = () => {
  const [foundPage, setFoundPage] = useState<PageFAQ | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      try {
        const pageIdentification = 'stake';
        const pages = await getFAQ(dynamics.faqContentUrl);

        setFoundPage(
          pages.find(
            (page: PageFAQ) => page['identification'] === pageIdentification,
          ),
        );
      } catch {
        // noop
      }
    })();
  }, []);

  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <FaqAccordion
        faqList={foundPage && foundPage['faq'] ? foundPage['faq'] : []}
      />
    </Section>
  );
};
