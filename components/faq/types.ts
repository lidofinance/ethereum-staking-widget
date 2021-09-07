import { FAQItem } from 'lib/faqList';

export interface FaqProps {
  faqList: FAQItem[];
  replacements?: {
    [key: string]: string;
  };
}
