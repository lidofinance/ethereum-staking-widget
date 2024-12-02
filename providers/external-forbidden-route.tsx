import { useState, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useRouterPath } from 'shared/hooks/use-router-path';
import { useConfig } from 'config';
import { ManifestConfigPage } from 'config/external-config';
import { HOME_PATH } from 'consts/urls';

import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';

export const ExternalForbiddenRouteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showContent, setShowContent] = useState(true);
  const router = useRouter();
  const path = useRouterPath();
  const { pages } = useConfig().externalConfig;

  const checkPathEffect = useCallback(() => {
    if (pages) {
      const paths = Object.keys(pages) as ManifestConfigPage[];
      const forbiddenPath = paths.find((pathKey) => path.includes(pathKey));
      if (forbiddenPath && pages[forbiddenPath]?.deactivate) {
        setShowContent(false);
        void router.push(HOME_PATH).finally(() => setShowContent(true));
      }
    }
  }, [pages, path, router]);

  const effectDeps = useMemo(() => [pages, path], [pages, path]);

  return (
    <>
      <LayoutEffectSsrDelayed effect={checkPathEffect} deps={effectDeps} />
      {showContent && children}
    </>
  );
};
