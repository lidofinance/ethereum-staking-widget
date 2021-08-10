import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import Section from 'components/section';
import { FaqProps } from './types';

const Faq: FC<FaqProps> = (props) => {
  const { faqList } = props;

  return (
    <Section title="FAQ">
      {faqList.map(({ id, title, content }, index) => (
        <Accordion
          key={id}
          defaultExpanded={index === 0}
          summary={String(title)}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Accordion>
      ))}
    </Section>
  );
};

export default Faq;
