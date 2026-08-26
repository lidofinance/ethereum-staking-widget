import { fileURLToPath } from 'node:url';

import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

// .cjs is intentionally not linted — matches the old `--ext ts,tsx,js,mjs`
const ALL_FILES = ['**/*.{js,mjs,ts,tsx,mts,cts}'];

// Successor of .eslintrc.json + @lidofinance/eslint-config (legacy-only, now
// inlined here). Composed from plugin presets where they match the old
// ruleset; the explicit sonarjs/unicorn lists are the hand-picked subset from
// @lidofinance/eslint-config rulesets/easy.js and have no preset equivalent.
export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['public/**', '**/*.cjs', 'dist/**', 'server/dist/**'],
  },
  {
    files: ALL_FILES,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactPlugin.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      sonarjs,
      unicorn,
      'react-hooks': reactHooks,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // --- adjustments to the presets above ---
      'no-useless-escape': 'warn',
      'valid-typeof': 'off', // covered by ts(2367)
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // new in typescript-eslint 8 recommended, was not part of the old
      // ruleset and existing code uses `cond && fn()` expressions
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      // allowInterfaces keeps the old no-empty-interface: off behavior
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'always' },
      ],

      // --- not in presets, kept from the old config ---
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // --- type-aware rules: a hand-picked set, not recommendedTypeChecked ---
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      // beware: has false positives whose auto-fix breaks tsc — see the
      // eslint-disable directives at the flagged sites before running --fix
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      // considerDefaultExhaustiveForUnions restores the typescript-eslint 6
      // behavior where a default clause made a union switch exhaustive
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],

      'promise/no-return-wrap': 'error',

      'import/no-unresolved': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'import/no-extraneous-dependencies': 'error',

      'sonarjs/max-switch-cases': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-empty-collection': 'warn',
      'sonarjs/no-extra-arguments': 'warn',
      'sonarjs/no-gratuitous-expressions': 'warn',
      'sonarjs/no-identical-conditions': 'warn',
      'sonarjs/no-identical-expressions': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-ignored-return': 'warn',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      // no-one-iteration-loop was removed in eslint-plugin-sonarjs 3
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/no-useless-catch': 'warn',
      'sonarjs/non-existent-operator': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/prefer-while': 'error',

      // throw-new-error is intentionally not enabled: since unicorn 49 it
      // flags any `*Error()` call and misfires on the ToastError helper
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/empty-brace-spaces': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'error',
      'unicorn/explicit-length-check': 'error',
      // named imports from path were fine under unicorn 48 (it did not
      // normalize the node: prefix); keep allowing them
      'unicorn/import-style': [
        'error',
        {
          styles: {
            path: { default: true, named: true },
            'node:path': { default: true, named: true },
          },
        },
      ],
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-array-method-this-argument': 'error',
      'unicorn/no-array-push-push': 'warn',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'warn',
      'unicorn/no-hex-escape': 'error',
      // renamed from no-instanceof-array; the default loose strategy also
      // flags Function and primitive wrappers — Function is excluded to keep
      // the old Array-only behavior for existing code
      'unicorn/no-instanceof-builtins': ['error', { exclude: ['Function'] }],
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-object-as-default-parameter': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-useless-length-check': 'warn',
      'unicorn/no-useless-promise-resolve-reject': 'warn',
      'unicorn/no-useless-spread': 'warn',
      'unicorn/no-useless-switch-case': 'warn',
      'unicorn/no-zero-fractions': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/prefer-add-event-listener': 'warn',
      'unicorn/prefer-array-find': 'warn',
      'unicorn/prefer-array-flat': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-array-index-of': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/relative-url-style': 'error',
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      'unicorn/template-indent': 'error',
    },
  },
  prettierConfig,
  // project-specific rules (former .eslintrc.json "rules" section)
  {
    files: ALL_FILES,
    rules: {
      'react/display-name': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          // typescript-eslint 8 changed the default to 'all'; keep the old
          // v6 behavior of not flagging unused catch parameters
          caughtErrors: 'none',
        },
      ],
      'promise/param-names': [
        'warn',
        {
          resolvePattern: '^_?(resolve)$|^_$',
          rejectPattern: '^_?(reject)$|^_$',
        },
      ],
      'func-style': ['error', 'expression'],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'zod',
              importNames: ['default'],
              message:
                "Default import from 'zod' bypasses the jitless alias. Use named imports: import { z } from 'zod'.",
            },
          ],
        },
      ],
      // `next/*` resolves to compatibility shims (shims/) kept for
      // node_modules dependencies only — app code must import react-router /
      // react-helmet-async directly. Warning severity keeps misuses
      // scannable via `yarn lint`; pre-commit runs --max-warnings=0, so new
      // violations still fail there. Runtime counterpart:
      // shims/shim-guard.ts.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ImportDeclaration[source.value=/^next(\\u002F|$)/]',
          message:
            'next/* is shimmed for dependencies only — import react-router / react-helmet-async directly (see shims/shim-guard.ts).',
        },
        {
          selector: 'ImportExpression[source.value=/^next(\\u002F|$)/]',
          message:
            'next/* is shimmed for dependencies only — import react-router / react-helmet-async directly (see shims/shim-guard.ts).',
        },
      ],
    },
  },
  // The api workspace imports framework-neutral repo-root modules (ABIs,
  // config/networks, earn fetchers) via tsconfig paths; the import resolver
  // sees those as imports of the root package itself and misflags them.
  {
    files: ['server/**'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  // loosened rules for tests and stories (from @lidofinance/eslint-config)
  {
    files: [
      '**/*.stories.*',
      '**/*.test.*',
      '**/*.spec.*',
      '**/__test__/**',
      '**/test/**',
    ],
    rules: {
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/error-message': 'off',
      'sonarjs/no-identical-conditions': 'off',
      'sonarjs/no-identical-expressions': 'off',
      'sonarjs/no-identical-functions': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
  },
);
