# CSS Migration — styled-components → CSS Modules

How and why app code migrates from styled-components to CSS modules, and how
to write styles during and after the transition. The agent-executable
companion of this guide is `.claude/skills/css-modules-migration/SKILL.md`
(it defers to this document — keep this one authoritative).

## Why

- styled-components is in maintenance mode and is a runtime CSS-in-JS
  engine: styles exist only after React renders, which blocks any static
  prerender of styled markup and adds render-path cost.
- `@lidofinance/lido-ui` (and reef-knot) are built ON styled-components v5,
  so the app cannot simply drop the package — the exit is incremental.
- Upstream merges must keep landing: files that import `styled-components`
  must continue to compile and run, migrated or not.

## Architecture of the exit

Four pieces, all in place:

| Piece                      | Where                                                                          | What it does                                                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolution seam            | `scripts/vite/styled-components-seam-plugin.ts` → `shims/styled-components.ts` | App-code imports of `styled-components` resolve to a pass-through shim re-exporting the real package; node_modules (lido-ui, reef-knot) keep the real one. One instance — SC theme context stays unified. Upstream code compiles untouched. |
| Token bridge (vars)        | `styles/lido-ui-tokens.css`                                                    | lido-ui's non-color theme tokens as `--lido-*` custom properties (spacing, font sizes, radii, durations, easings, shadows). Colors are injected by lido-ui itself as `--lido-color-*`.                                                      |
| Token bridge (breakpoints) | `styles/lido-ui-media.css`                                                     | lido-ui's media queries as `@custom-media --lido-media-*` (+ `--custom-media-nav-mobile`). Injected into every CSS file and resolved at build time by the PostCSS pipeline.                                                                 |
| Drift guard                | `styles/lido-ui-tokens.test.ts`                                                | Asserts both bridge files stay byte-equal to the installed lido-ui theme (and app constants). A lido-ui bump that moves a token fails unit tests instead of skewing migrated CSS silently.                                                  |

Authoring pipeline (`postcss.config.js`): `@csstools/postcss-global-data`
injects the `@custom-media` definitions, then `postcss-preset-env` transpiles
per the `browserslist` in package.json — native nesting, custom media, media
range syntax, vendor prefixes. Production minification is Vite's default
(Lightning CSS). Linting: `stylelint.config.js` (see [Linting](#linting)).

Reference conversion (the pilot): `features/settings/settings-form/styles.ts`
with its `styles.module.css`.

## Contract rules (non-negotiable)

1. **Exports are the API.** The styles module keeps its path and every export
   keeps its name and consumer-visible props. Consumers must not change —
   that's what lets upstream merges land.
2. **One `styles.module.css` next to the styles file.** Class names are
   lowerCamelCase mirrors of the component names (`Actions` → `.actions`),
   accessed as `styles.actions`.
3. **Wrappers preserve the styled-components contract**: forward `ref`, merge
   an incoming `className` (parents may restyle), pass all other props
   through. For bare host elements use `styledElement` from
   `styles/styled-element.tsx`; write a small explicit component when props
   drive styling.
4. **No visual change.** Verify in dev in BOTH themes (light/dark) before and
   after. Same DOM structure — `:first-child`/`& + &` style selectors depend
   on it.
5. Don't migrate consumers, don't rename, don't "improve" layout in the same
   change. Token upgrades (below) are the only allowed value changes, and they
   must be rendering-identical.

## Mapping guide

### Theme tokens → CSS variables (always)

Every `${({ theme }) => theme.X}` becomes a var:

| styled-components                              | CSS modules                          |
| ---------------------------------------------- | ------------------------------------ |
| `${({theme}) => theme.spaceMap.md}px`          | `var(--lido-space-md)`               |
| `${({theme}) => theme.fontSizesMap.xxs}px`     | `var(--lido-font-size-xxs)`          |
| `${({theme}) => theme.borderRadiusesMap.lg}px` | `var(--lido-border-radius-lg)`       |
| `${({theme}) => theme.duration.fast}`          | `var(--lido-duration-fast)`          |
| `${({theme}) => theme.ease.outQuad}`           | `var(--lido-ease-outQuad)`           |
| `${({theme}) => theme.boxShadows.sm}`          | `var(--lido-box-shadow-sm)`          |
| `${({theme}) => theme.colors.textSecondary}`   | `var(--lido-color-textSecondary)`    |
| `${({theme}) => theme.mediaQueries.md}`        | `@media (--lido-media-md)`           |
| `${devicesHeaderMedia.mobile}`                 | `@media (--custom-media-nav-mobile)` |

Do not write raw breakpoint widths — the only exception is a legacy,
off-token-scale query converted verbatim (e.g. `(width <= 500px)`), which
stylelint surfaces as a warning by design.

### Hardcoded values → tokens (upgrade while you're there)

The migration should leave files MORE token-driven than it found them:

- A literal that exactly equals a token and clearly means it → tokenize:
  `padding: 16px` → `var(--lido-space-md)`; `font-size: 12px` →
  `var(--lido-font-size-xxs)`. If a literal is off-scale (e.g. `10px` gap,
  `42px` margin), keep it verbatim — do not round onto the scale.
- A hex/rgba that duplicates a lido palette color → `var(--lido-color-*)`
  (the value must be right in both themes — if the literal was correct in
  only one theme, that's a bug to flag, not silently fix).
- A repeated app-specific value → promote to a `--custom-*` variable in
  `styles/global.css`. One-off values stay local literals.
- Repeated magic numbers within one file → a local var on the top-level class
  (`--dot-size: 6px;`) referenced by descendants.

### theme.name branches → `[data-lido-theme]` CSS

Never branch on the theme in JS — `theme.name` is `'light'` until hydration
and flashes. Branch in CSS on the attribute stamped by the blocking head
script (three theme states, not two — rationale at the top of
`styles/global.css`):

```css
.glow {
  display: block; /* light + explicit light */

  /* system dark */
  @media (prefers-color-scheme: dark) {
    html:not([data-lido-theme='light']) & {
      display: none;
    }
  }

  /* explicit dark */
  [data-lido-theme='dark'] & {
    display: none;
  }
}
```

### Boolean/variant props → data-attributes

`$`-transient props existed to keep props off the DOM; data-attributes are the
CSS-modules equivalent:

```tsx
// was: styled(Switcher)<{ $disabled?: boolean }>`opacity: ${({$disabled}) => ...}`
export const SwitcherStyled = ({ disabled, className, ...rest }: Props) => (
  <Switcher
    {...rest}
    data-disabled={disabled ? '' : undefined}
    className={cx(styles.switcher, className)}
  />
);
```

```css
.switcher[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

- Boolean: attribute present/absent (`data-open`, selector `[data-open]`).
- Enum/variant: `data-variant={variant}`, selector `[data-variant='error']`.
- Prefer a real ARIA/semantic attribute when one exists (`aria-disabled`,
  `disabled` on form controls, `aria-expanded`).
- `cx` = join truthy class names: `[a, b].filter(Boolean).join(' ')` (no
  classnames dependency in this repo).

### Continuous values → inline custom properties

```tsx
<div
  className={styles.bar}
  style={{ '--bar-height': height } as CSSProperties}
/>
```

```css
.bar {
  height: var(--bar-height, 52px); /* default = old prop default */
}
```

### `css` mixins → composes

A shared `css\`\``fragment becomes a class; consumers use`composes: textStyle;`(same file) or`composes: textStyle from './shared.module.css';`(cross-file, first
declaration in the rule). Conditional`css` blocks fold into a data-attribute
selector instead.

### `keyframes` → `@keyframes` in the module

CSS modules scope animation names automatically. Parameterized keyframes
become ONE `@keyframes` reading a custom property the element sets per
variant:

```css
.status {
  --pulse-rgb: 83, 186, 149;
}
.status[data-variant='error'] {
  --pulse-rgb: 225, 77, 77;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-rgb), 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--pulse-rgb), 0);
  }
}
```

### `.attrs({...})` → default props in the wrapper

All `.attrs` in app code are static objects — spread them in the wrapper
before the incoming props: `<img alt="" {...props} />`.

### Component selectors `${Other}` → explicit child class

Where a template interpolates another styled component as a selector
(`&:hover ${SubBalance} { … }`), give the child a stable class in the same
module and select `.parent:hover .subBalance { … }`.

### `styled(LidoUiComponent)` → className + specificity guard

While lido-ui is still on styled-components, its styles are injected at
runtime AFTER static stylesheets, so a tied specificity loses. Double the
class to win deterministically:

```css
.card.card {
  background: var(--custom-background-dark);
}
```

```tsx
export const StyledCard = (props: ComponentProps<typeof Card>) => (
  <Card {...props} className={cx(styles.card, props.className)} />
);
```

- Only rules that OVERRIDE something lido-ui itself sets need the doubling;
  additive rules (margins, gaps) don't.
- These are the highest-regression-risk conversions — screenshot before/after,
  both themes.
- `forwardedAs="footer"` on a styled(lido-ui) wrapper becomes plain
  `as="footer"` passed through to the lido-ui component (it handles `as`
  natively).

### `createGlobalStyle` → plain CSS file

Already done (`styles/global.css`); there should be no new global styles. If
an upstream merge brings one, convert the same way.

## Best practices

- **Nesting is allowed and preferred** — postcss-preset-env downlevels it per
  browserslist, so styled-components templates convert nearly copy-paste:
  keep `& > svg { … }`, `&:hover { … }`, nested `@media` blocks. Keep nesting
  shallow (one level is almost always enough); the transform may wrap complex
  compound parents in `:is()`, which can bump specificity — the stylelint cap
  catches runaways.
- **Modern media syntax**: range notation `(width <= 400px)` is enforced by
  stylelint and transpiled by PostCSS — but reach for the `--lido-media-*` /
  `--custom-media-*` tokens first; raw widths are for legacy one-offs only.
- **Keep specificity minimal**: single class where possible; the `.x.x`
  doubling is exclusively for overriding still-SC lido-ui internals. Use
  `:where()` to keep compound selectors at zero when providing defaults meant
  to be overridable.
- **No `:global`** except when targeting lido-ui-rendered internals that
  expose no className hook — and then a stylelint-disable comment with a
  `-- reason` naming the component is required (enforced).
- **Custom property naming**: `--lido-*` is reserved for bridged lido-ui
  tokens (never invent one); `--custom-*` for app-wide values in global.css;
  unprefixed local names (`--pulse-rgb`) for file-local vars. Same split for
  breakpoints: `--lido-media-*` bridged, `--custom-media-*` app-level, both
  only in `styles/lido-ui-media.css`. Stylelint enforces the reservations.
- **Dark theme is not optional**: any color literal you touch must be checked
  on `[data-lido-theme='dark']`. If a value must differ per theme, use an
  existing `--lido-color-*` / `--custom-*` var or add a `--custom-*` following
  the three-state pattern — never `@media (prefers-color-scheme)` alone.
- **Don't reach back into JS for styling**: no theme reads, no
  `useThemeToggle` for CSS concerns, no window-size hooks where a media query
  does the job.
- **Class names in tests**: hashed module classes must not appear in tests or
  e2e selectors — use `data-testid`.
- **TS can't spellcheck `styles.foo`** (css imports are untyped via
  `global.d.ts`): after converting, grep each `styles.<name>` against the
  `.module.css` — a typo silently yields `undefined` className.

## Linting

`stylelint.config.js` extends `stylelint-config-standard` +
`stylelint-config-css-modules` and encodes the rules above: lowerCamelCase
class/keyframes patterns, specificity capped at `0,3,0`, `:global` banned
without a described disable, reserved-prefix definitions blocked in modules,
and two **warning-level nudges** — variables required for
color/font-size/border-radius values, and breakpoints restricted to token
values. Warnings are non-blocking on purpose: legacy values converted
verbatim may trigger them; NEW styling shouldn't.

Run: `yarn lint:css` (part of `yarn lint`; also in lint-staged).

VS Code: the built-in CSS server doesn't know draft at-rules — the repo's
`.vscode/css-custom-data.json` + `"css.customData"` setting teach it
`@custom-media` (note `.vscode` is gitignored; copy these two files locally
if you don't have them).

## Per-file migration checklist

1. Read the styles file AND its consumers; note every export, prop, and DOM
   tag. Check no other file does `styled(ExportedThing)` on an export — if
   one does, that file needs the child-class treatment or migrates together.
2. Write `styles.module.css` using the mapping guide; apply token upgrades.
3. Rewrite the styles file: `styledElement` for plain hosts, explicit
   wrappers for prop-driven ones. Remove the `styled-components` import.
4. `yarn tsc --noEmit && yarn eslint <dir> && yarn lint:css && yarn vitest run`
   — all clean. Read any new stylelint warnings: on converted-verbatim legacy
   values they're expected; on new styling they mean "use a token".
5. Visual check in `yarn dev`: the affected route(s), light AND dark theme,
   desktop AND ≤479px width. For lido-ui overrides, compare against the
   original if in doubt.
6. Commit the pair (styles file + module.css) per feature; nothing else in
   the diff.

Order of migration: low-upstream-churn features first — once a file is
migrated, upstream edits to it conflict structurally.

## When NOT to convert (yet)

- The file styles a reef-knot / wallet-modal integration point whose DOM you
  don't control — verify extra carefully or defer.
- A pattern with no static equivalent — leave the file on styled-components
  (the seam keeps it working forever) and note it in the PR.

## Endgame

The seam, bridge, and this guide cover app code. `styled-components` itself
leaves the bundle only when the last node_modules consumer does: lido-ui
components replaced by their SC-free successors (`@lidofinance/lido-app-ui`
pattern — plain CSS + classnames) and reef-knot's wallet modal updated or
replaced. Until then the single shared SC 5.x instance must be preserved.
