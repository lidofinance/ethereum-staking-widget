import { FC, MouseEvent, useCallback } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { useNavigate } from 'react-router';

import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

import type { FaqEntry } from './faq-data';

/**
 * Renders FAQ entries from `faq-data.ts` — the same data the build-time
 * prerender puts into the static body/JSON-LD, so the visible FAQ can
 * never diverge from what crawlers see.
 *
 * Answers are limited HTML (see faq-data.ts). Internal `<a href="/...">`
 * links are upgraded to SPA navigation via a delegated click handler
 * (plain anchors would full-reload, and would break under the IPFS hash
 * router). Anchor (`#id`) and external links keep native behavior;
 * `data-matomo` attributes keep working through the Section-level
 * delegated tracking handler.
 */
const FaqAnswer: FC<{ html: string }> = ({ html }) => {
  const navigate = useNavigate();

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as Element;
      const anchor = target.closest('a');
      const href = anchor?.getAttribute('href');
      if (href?.startsWith('/')) {
        event.preventDefault();
        void navigate(href);
      }
    },
    [navigate],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export const FaqList: FC<{ entries: FaqEntry[] }> = ({ entries }) => {
  return (
    <>
      {entries.map((entry) => {
        // Only pass defaultExpanded when the data sets it — otherwise it
        // would override AccordionNavigatable's hash-based auto-expand.
        const expandProp =
          entry.defaultExpanded === undefined
            ? {}
            : { defaultExpanded: entry.defaultExpanded };
        return entry.id ? (
          <AccordionNavigatable
            key={entry.question}
            id={entry.id}
            summary={entry.question}
            {...expandProp}
          >
            <FaqAnswer html={entry.answerHtml} />
          </AccordionNavigatable>
        ) : (
          <Accordion
            key={entry.question}
            summary={entry.question}
            {...expandProp}
          >
            <FaqAnswer html={entry.answerHtml} />
          </Accordion>
        );
      })}
    </>
  );
};
