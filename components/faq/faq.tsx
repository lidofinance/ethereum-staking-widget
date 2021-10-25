import { FC, memo } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import Section from 'components/section';
import { FaqProps } from './types';
import styled from 'styled-components';
import { replaceAll } from 'utils/replaceAll';

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
`;

const Faq: FC<FaqProps> = (props) => {
  const { faqList, replacements } = props;

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
};

export default memo(Faq);
