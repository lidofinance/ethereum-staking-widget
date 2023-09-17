import { FC, useEffect, useState } from 'react';
import { FaqAccordion, getFAQ, PageFAQ } from '@lidofinance/ui-faq';
import { dynamics, matomoEventMap } from 'config';
import { Section } from 'shared/components';
// import { useMatomoEventHandle } from 'shared/hooks';

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

        return () => {};
      } catch {
        // noop
      }
    })();
  }, []);

  // const onClickHandler = useMatomoEventHandle();

  return (
    // <Section title="FAQ" onClick={onClickHandler}>
    <Section title="FAQ">
      <FaqAccordion
        faqList={foundPage && foundPage['faq'] ? foundPage['faq'] : []}
        matomoEventMap={matomoEventMap}
      />
    </Section>
  );
};
