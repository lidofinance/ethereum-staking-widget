/**
 * Static rules for the CSS-modules migration — the mechanical half of
 * .claude/skills/css-modules-migration/SKILL.md. Prettier owns formatting.
 *
 * `warning` severity = nudge, non-blocking: legacy values converted verbatim
 * from styled-components may violate them; new code should not.
 */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-css-modules'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'dist-node/**',
    'coverage/**',
    'playwright-report/**',
    'server/**',
  ],
  // A stylelint-disable comment must carry a `-- reason` description.
  reportDescriptionlessDisables: true,
  rules: {
    // Class names mirror component names in lowerCamelCase (styles.actions).
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      { message: 'Expected class to be lowerCamelCase (mirrors the export)' },
    ],
    // Token names keep lido-ui's camelCase keys (--lido-ease-inOutSine,
    // --lido-color-textSecondary), so allow camelCase segments.
    'custom-property-pattern': '^[a-z][a-zA-Z0-9-]*$',
    'keyframes-name-pattern': '^[a-z][a-zA-Z0-9]*$',

    // Keep specificity flat; 0,3,0 leaves room for the `.x.x` doubling that
    // overrides still-styled-components lido-ui internals (see the skill).
    'selector-max-id': 0,
    'selector-max-specificity': '0,3,0',
    'selector-max-type': 2,

    // :global escapes CSS-modules scoping — needs a justifying
    // `/* stylelint-disable-next-line -- <why> */` naming the component.
    'selector-pseudo-class-disallowed-list': ['global'],

    // Maximize token usage: these properties should reference variables.
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke', 'font-size', 'border-radius'],
      {
        ignoreValues: [
          'transparent',
          'currentColor',
          'inherit',
          'initial',
          'unset',
          'none',
          '0',
          '50%', // border-radius circles
        ],
        severity: 'warning',
      },
    ],

    // Breakpoints should be @custom-media tokens (--lido-media-*,
    // --custom-media-*); raw widths are flagged. The listed values are the
    // token definitions themselves (styles/lido-ui-media.css) plus 500px,
    // a pre-migration legacy breakpoint kept verbatim.
    'media-feature-name-value-allowed-list': [
      {
        'max-width': ['359px', '479px', '767px', '950px', '1023px', '500px'],
        // Same values for modern range notation ((width <= 479px)), which
        // stylelint-config-standard's media-feature-range-notation enforces.
        width: ['359px', '479px', '767px', '950px', '1023px', '500px'],
      },
      { severity: 'warning' },
    ],
  },
  overrides: [
    {
      // Reserved prefixes: --lido-* only in the token bridge, --custom-*
      // only in global.css. Local vars in modules are unprefixed.
      // (property-disallowed-list, not custom-property-pattern: the latter
      // also matches var() USAGES, which are of course allowed.)
      files: ['**/*.module.css'],
      rules: {
        'property-disallowed-list': [
          ['/^--lido-/', '/^--custom-/'],
          {
            message:
              'Do not define --lido-*/--custom-* in modules (reserved for styles/lido-ui-tokens.css and styles/global.css)',
          },
        ],
      },
    },
    {
      // Values are byte-equal mirrors of lido-ui theme strings (drift test);
      // stylistic normalization would break the equality.
      files: ['styles/lido-ui-tokens.css'],
      rules: {
        'length-zero-no-unit': null,
      },
    },
  ],
};
