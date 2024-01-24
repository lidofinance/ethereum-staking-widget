import { Accordion } from '@lidofinance/lido-ui';
import { useInpageNavigation } from 'providers/inpage-navigation';
import { useCallback } from 'react';

type AccordionNavigatableProps = React.ComponentProps<typeof Accordion> & {
  id: string;
};

export const AccordionNavigatable = (props: AccordionNavigatableProps) => {
  const { onCollapse, id } = props;
  const { hashNav, resetSpecificAnchor } = useInpageNavigation();

  const handleCollapse = useCallback(() => {
    resetSpecificAnchor(id);
    onCollapse?.();
  }, [resetSpecificAnchor, id, onCollapse]);

  return (
    <Accordion
      defaultExpanded={hashNav === id}
      {...props}
      onCollapse={handleCollapse}
    />
  );
};
