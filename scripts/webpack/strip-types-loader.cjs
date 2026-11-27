// Strips TypeScript with the project's own (current) Babel before Next's
// Babel sees the file.
//
// Next 12 transpiles with its bundled @babel/core 7.18, which cannot parse
// TS >= 4.9 syntax (`satisfies`, `export type *`, `const` type parameters):
// `yarn types` passes but the build fails. This pass only removes types, so
// Next's loader still does everything else (next/babel preset, decorators,
// styled-components) on plain JS/JSX. Drop it once Next is upgraded.
const babel = require('@babel/core');

const PRESET_TYPESCRIPT = require.resolve('@babel/preset-typescript');
const SYNTAX_DECORATORS = require.resolve('@babel/plugin-syntax-decorators');

module.exports = function stripTypesLoader(source, inputSourceMap) {
  const callback = this.async();
  babel
    .transformAsync(source, {
      filename: this.resourcePath,
      // only this pass: never the project .babelrc, which Next applies next
      babelrc: false,
      configFile: false,
      sourceMaps: this.sourceMap,
      inputSourceMap: inputSourceMap || undefined,
      presets: [[PRESET_TYPESCRIPT, { allowDeclareFields: true }]],
      // keep decorators for Next's pass, which transforms them (.babelrc)
      plugins: [
        [
          SYNTAX_DECORATORS,
          { version: '2021-12', decoratorsBeforeExport: true },
        ],
      ],
    })
    .then(
      (result) => callback(null, result.code, result.map || undefined),
      callback,
    );
};
