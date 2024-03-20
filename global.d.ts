interface Window {
  // see _document.js for definition
  _paq: undefined | [string, ...unknown[]][];
}

declare module '*.svg' {
  /**
   * Use `any` to avoid conflicts with
   * `@svgr/webpack` plugin or
   * `babel-plugin-inline-react-svg` plugin.
   */
  const content: any;
  export const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'>
  >;
  export default content;
}
