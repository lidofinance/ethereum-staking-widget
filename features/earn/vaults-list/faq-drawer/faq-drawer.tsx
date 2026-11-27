import { useState } from 'react';
import { Accordion } from '@lidofinance/lido-app-ui';

import { FaqAnswer, FaqDrawer } from '../../shared/faq';

import { EARN_LIST_FAQ } from './faq-items';

export const VaultsListFaqDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FaqDrawer open={isOpen} onOpenChange={setIsOpen}>
      {EARN_LIST_FAQ.map(({ id, question, answer }) => (
        <Accordion
          key={id}
          title={question}
          defaultExpanded={id === EARN_LIST_FAQ[0].id}
          dataTestId={{ root: `earn-faq-${id}` }}
        >
          <FaqAnswer>{answer}</FaqAnswer>
        </Accordion>
      ))}
    </FaqDrawer>
  );
};
