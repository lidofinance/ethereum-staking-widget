import { FC, memo } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { Section } from 'shared/components';
import { replaceAll } from 'utils/replaceAll';
import { FAQItem } from 'lib/faqList';

export interface FaqProps {
  faqList: FAQItem[];
  replacements?: {
    [key: string]: string;
  };
}

const FaqItem = styled.div`
  p {
    margin: 0 0 1.6em;
  }

  p + ul,
  p + ol,
  ul + p,
  ol + p {
    margin-top: -1.6em;
  }

  ul > li,
  ol > li {
    margin-top: 0;
    margin-bottom: 0;

    & > p {
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  a {
    text-decoration: none;
  }
`;

export const Faq: FC<FaqProps> = memo(({ faqList, replacements }) => {
  return (
    <Section title="FAQ">
      {faqList.map(({ id, title, content }, index) => {
        const html = replaceAll(content, replacements);

        return (
          <Accordion
            key={id}
            defaultExpanded={index === 0}
            summary={String(title)}
          >
            <FaqItem
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          </Accordion>
        );
      })}
    </Section>
  );
});
