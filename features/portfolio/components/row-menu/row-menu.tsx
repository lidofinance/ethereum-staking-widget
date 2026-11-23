import { useRef, useState, type FC } from 'react';
import { Popover } from '@lidofinance/lido-app-ui';

import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config/disabled-path';
import { ReactComponent as MoreIcon } from 'assets/icons/more-horizontal.svg';

import type { PortfolioRow } from '../../types';
import { getTokenActions } from '../../utils';
import { MenuButton, MenuLink, MenuList, MoreButton } from './styles';

type RowMenuProps = {
  row: PortfolioRow;
  onDetails: () => void;
};

// the row menu of the design: token actions, plus details for every token
export const RowMenu: FC<RowMenuProps> = ({ row, onDetails }) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { pages } = useConfig().externalConfig;
  const actions = getTokenActions(row.iconToken).filter(
    (action) => !isDisabledPath(action.href, pages),
  );

  return (
    <>
      <MoreButton
        ref={anchorRef}
        type="button"
        aria-label={`Actions for ${row.name}`}
        data-testid="portfolioRowMore"
        onClick={(event) => {
          // the row opens the drawer on click; the menu button must not
          event.stopPropagation();
          setIsOpen((wasOpen) => !wasOpen);
        }}
      >
        <MoreIcon aria-hidden />
      </MoreButton>
      <Popover
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={anchorRef}
        placement="bottom"
        align="end"
        aria-label={`Actions for ${row.name}`}
        dataTestId={{ root: 'portfolioRowMenu' }}
      >
        <MenuList role="menu">
          {actions.map((action) => (
            <MenuLink key={action.label} href={action.href} role="menuitem">
              {action.label}
            </MenuLink>
          ))}
          <MenuButton
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDetails();
            }}
          >
            Details
          </MenuButton>
        </MenuList>
      </Popover>
    </>
  );
};
