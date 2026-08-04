// Window._paq / Window.__env__ are declared by @lidofinance/analytics-matomo
// (its d.ts ships a `declare global` block) — do not redeclare them here,
// TS requires merged declarations to match exactly.

// TS 6 type-checks side-effect imports (e.g. `import 'nprogress/nprogress.css'`),
// which previously were silently ignored
declare module '*.css';

// `import url from 'foo.svg'` → URL string (Vite default asset handling).
declare module '*.svg' {
  const url: string;
  export default url;
}

// `import Component from 'foo.svg?react'` → React component (vite-plugin-svgr).
declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const Component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default Component;
}

// `.md` imports are raw strings (rawMarkdown plugin in vite.config.ts,
// replaces webpack's raw-loader).
declare module '*.md' {
  const content: string;
  export default content;
}
