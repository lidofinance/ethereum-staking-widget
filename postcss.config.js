import { fileURLToPath } from 'node:url';

import postcssGlobalData from '@csstools/postcss-global-data';
import postcssPresetEnv from 'postcss-preset-env';

/**
 * CSS-modules authoring pipeline (styled-components exit):
 *
 * - postcss-global-data makes the @custom-media breakpoint tokens
 *   (styles/lido-ui-media.css) visible to every CSS file — @custom-media
 *   definitions don't cross file boundaries on their own.
 * - postcss-preset-env transpiles per the browserslist in package.json:
 *   native nesting, @media (--lido-media-*) custom media, media range
 *   syntax, vendor prefixes (autoprefixer built in). Features the targets
 *   support natively pass through untouched.
 *
 * Production minification stays with Vite's default (Lightning CSS).
 */
export default {
  plugins: [
    postcssGlobalData({
      files: [
        fileURLToPath(new URL('styles/lido-ui-media.css', import.meta.url)),
      ],
    }),
    postcssPresetEnv({
      features: {
        // Relied on by the conversion guide — pinned on regardless of
        // stage/browserslist so authoring stays stable across target bumps.
        'nesting-rules': true,
        'custom-media-queries': true,
        'media-query-ranges': true,
      },
    }),
  ],
};
