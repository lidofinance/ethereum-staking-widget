import { trackEvent } from '@lidofinance/analytics-matomo';
import { FAQAccordionOnLinkClickProps } from '@lidofinance/ui-faq';

export type FaqAccordionOnLinkClickFactoryProps =
  FAQAccordionOnLinkClickProps & { pageId: string };

export const faqAccordionOnLinkClick = ({
  pageId,
  questionId,
  question,
  linkContent,
}: FaqAccordionOnLinkClickFactoryProps) => {
  const actionEvent = `Push «${linkContent}» in FAQ ${question} on stake widget`;
  // Make event like `<project_name>_faq_<page_id>_<question_id>_<link_content>`
  const nameEvent = `eth_widget_faq_${pageId}_${questionId}_${linkContent}`;
  trackEvent('Ethereum_Staking_Widget', actionEvent, nameEvent);
};
