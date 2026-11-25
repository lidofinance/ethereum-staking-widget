import { useRef, useState } from 'react';
import { Accordion, Drawer, Fab, IconQuestion } from '@lidofinance/lido-app-ui';

import { EARN_LIST_FAQ } from './faq-items';
import { FaqAnswer } from './styles';

const DRAWER_WIDTH = 500;

// floating help button with the Earn FAQ, as in the library FAQ drawer recipe
export const FaqDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Safari does not focus a clicked button, so give the drawer a target
  const fabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Fab
        ref={fabRef}
        icon={<IconQuestion />}
        aria-label="Frequently asked questions"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        data-testid="earn-faq-button"
      />
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="FAQ"
        width={DRAWER_WIDTH}
        returnFocusTo={fabRef}
        labels={{ close: 'Close' }}
        dataTestId={{ root: 'earn-faq-drawer' }}
      >
        <div>
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
        </div>
      </Drawer>
    </>
  );
};
