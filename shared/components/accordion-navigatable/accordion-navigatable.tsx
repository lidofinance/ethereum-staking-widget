import { Accordion } from '@lidofinance/lido-ui';
import { useInpageNavigation } from 'providers/inpage-navigation';

type AccordionNavigatableProps = React.ComponentProps<typeof Accordion> & {
  id: string;
};

export const AccordionNavigatable = (props: AccordionNavigatableProps) => {
  const { hashNav } = useInpageNavigation();
  return <Accordion defaultExpanded={hashNav === props.id} {...props} />;
};
