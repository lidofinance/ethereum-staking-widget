import { useState, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config';
import { HOME_PATH } from 'consts/urls';

import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';

export const ExternalForbiddenRouteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showContent, setShowContent] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;

  const checkPathEffect = useCallback(() => {
    if (pages && isDisabledPath(path, pages)) {
      setShowContent(false);
      // search params exclude route params — they must not leak into the
      // redirect query string (`/?vault=usd&action=deposit`)
      void Promise.resolve(
        navigate({ pathname: HOME_PATH, search: searchParams.toString() }),
      ).finally(() => setShowContent(true));
    }
  }, [pages, path, navigate, searchParams]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={effectDeps} />
      {showContent && children}
    </>
  );
};
