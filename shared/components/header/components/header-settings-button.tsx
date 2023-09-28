import { useCallback } from 'react';

// @ts-expect-error https://www.npmjs.com/package/@svgr/webpack
import { ReactComponent as GearIcon } from 'assets/icons/gear.svg';
import { useRouterPath } from 'shared/hooks/use-router-path';
import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';

import { HeaderControlButton } from './header-control-button';

export const HeaderSettingsButton = () => {
  const push = usePrefixedPush();
  const route = useRouterPath();
  const handleClick = useCallback(() => push('/settings'), [push]);

  return (
    <HeaderControlButton isActive={route === '/settings'} onClick={handleClick}>
      <GearIcon />
    </HeaderControlButton>
  );
};
